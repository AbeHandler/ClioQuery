"""
This is the file that actually processes the data from Google

The data from Google comes in a very annoying format. This file basically
just translates it to a cleaner format

It runs CoreNLP annotation and adds some metadata like the token
indexes of the compression

"""

from unidecode import unidecode

import json
import itertools
import sys
import requests

url = 'http://localhost:9001/?properties={"annotators":"tokenize,pos,lemma,depparse,ner","outputFormat":"json", "tokenize.whitespace":"True", "ssplit.eolonly":"True"}'


"""these are three helpers that deal w/
  getting data out of an annoying google
   format into an easier format"""


def graph_node_to_token_indexes(node):
    """get the token indexes inside the node of the graph"""
    for word in node["word"]:
        yield id2index[word["id"]]


def de_unicode(t):
    for token in t:
        token["form"] = unidecode(token["form"])
        yield (token)


def get_source_toks(ln):
    # again ln["source_tree"]["node"]'s may have multi words
    source_toks = [list(de_unicode(_["word"])) for _ in ln["source_tree"]["node"]]
    source_toks = list(itertools.chain(*source_toks))
    source_toks = [_ for _ in source_toks if _["id"] != -1]
    return source_toks


with open(sys.argv[1], "r") as inf:
    with open(sys.argv[1].replace(".jsonl", "") + ".source", "w") as of_s:
        for lno, ln in enumerate(inf):
            ln = json.loads(ln)
            try:
                if lno % 1000 == 0:
                    print(lno)

                graph = [
                    {"parent_id": k["parent_id"], "child_id": k["child_id"]}
                    for k in ln["graph"]["edge"]
                ]
                assert all([c in graph for c in ln["compression"]["edge"]])

                # compression edge is a subset of graph edge. so the parent and child in compression edge
                # refer to the nodes in a graph. Those nodes may have more than one token in them.

                source_toks = get_source_toks(ln)

                sentence_raw = " ".join([_["form"] for _ in source_toks])

                sentence = json.loads(requests.post(url, data=sentence_raw).text)
                assert len(sentence["sentences"]) == 1
                sentence = sentence["sentences"][0]

                sentence["original"] = ln["graph"]["sentence"]
                sentence["headline"] = ln["headline"]

                id2index = {}
                for sno, s in enumerate(source_toks):
                    id_ = s["id"]
                    index = sno + 1
                    id2index[id_] = index
                id2index[
                    -1
                ] = 0  # -1 in fillipova's tokenization == 0 aka root for stanfordcorenlp

                graph_nodes_as_indexes = [
                    list(graph_node_to_token_indexes(_)) for _ in ln["graph"]["node"]
                ]

                # e.g. 'edge': [{'parent_id': 11, 'child_id': 10}, {'parent_id': 30, 'child_id': 11},
                compression = ln["compression_untransformed"]["edge"]

                assert len(sentence["tokens"]) == len(source_toks)

                for sno, s in enumerate(sentence["tokens"]):
                    assert s["word"] == source_toks[sno]["form"]

                sentence["enhancedPlusPlusDependencies"] = None

                """this part finds the compression indexes"""
                compression_ixs = []
                for c in compression:
                    # parent_node_in_graph = [id2index[i] for _ in graph_nodes_as_indexes if c["parent_id"] in _][0]
                    child_node_in_graph = [
                        _
                        for _ in graph_nodes_as_indexes
                        if id2index[c["child_id"]] in _
                    ]
                    for child in child_node_in_graph:
                        compression_ixs = compression_ixs + child

                compression_ixs = sorted(list(set(compression_ixs)))
                compression_ixs = [_ for _ in compression_ixs]

                sentence["compression_indexes"] = compression_ixs

                of_s.write(json.dumps(sentence) + "\n")

            except AssertionError as e:
                print("assertion error {}-{}-{}".format(e, lno, sys.argv[1]))
            except IndexError as e:  # catch all that breaks
                ms = "compression references a tok id not in source {}-{}-{}".format(
                    e, lno, sys.argv[1])
                print(ms)
