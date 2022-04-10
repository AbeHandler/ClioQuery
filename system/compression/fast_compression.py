"""
assume fewer ops are better

assume no more than 3 ops, so you can enum. You can't enum big many op things

assume fewer ellipses is better

see notes.md
"""

from collections import defaultdict
from tqdm import tqdm as tqdm
from random import shuffle
import itertools
import json
import string


PUNCT = [j for j in string.punctuation] + \
    ['"', "''", '``', "'", "(", "--", "-", ")", ',']


def get_Q_indexes(sentence, query):
    lower_q = [o.lower() for o in query]
    return {j["index"] for j in sentence["tokens"] if j["word"].lower() in lower_q}


def get_leafs(sentence):
    """get all leafs of a tree"""
    potential_leafs = set()

    for s in sentence["basicDependencies"]:
        dependent = s["dependent"]
        if s["dep"] != "punct":
            potential_leafs.add(dependent)

    for s in sentence["basicDependencies"]:
        governor = s["governor"]
        if governor in potential_leafs:
            potential_leafs.remove(governor)

    return potential_leafs


def get_parents(sentence):
    pi = {}
    for s in sentence["basicDependencies"]:
        dependent = s["dependent"]
        governor = s["governor"]
        pi[dependent] = governor
    return pi


def getv2descendants(sentence):
    """
    basically loop up from the leafs keeping track
    of what are the descendents of which vertexes
    """

    # init

    pi = get_parents(sentence)

    v2descendants = defaultdict(set)

    for p in pi:
        if p != 0:
            v2descendants[p] = {p}

    leafs = get_leafs(sentence)

    last_leafs = set(leafs)

    # loop up from leafs

    for j in range(1, 10):  # safer than while loop

        new_leafs = set()

        for l in last_leafs:
            parent = pi[l]

            if parent != 0:  # exclude root
                v2descendants[parent] = v2descendants[parent] | v2descendants[l] | {
                    l}
                new_leafs.add(parent)

        last_leafs = new_leafs
        if len(new_leafs) == 0:  # you have reached root
            break

    return v2descendants


def op_retains_Q(Q: set, v2descendants: dict, deletions: list):
    """if any deletion retains Q"""
    for d in deletions:
        if len(Q & v2descendants[d]) > 0:  # op removes q
            return False
    return True


def get_len_post_ops(v2len, total_lenght_of_sentence: int, v2descendants: dict, proposed_deleted_vs: list):
    tot_c = total_lenght_of_sentence
    for proposed_deleted_v in proposed_deleted_vs:
        for descendant in v2descendants[proposed_deleted_v]:
            tot_c -= 1 + v2len[descendant]

    tot_c += 1  # overcounted one

    return tot_c


def getAllPossibleKOps(v2len, v2descendants, V: set, k: int, Q: set, total_length: int, char_budget: int):
    """
    a K op deletes exactly K subtrees

    It must keep Q

    """

    def nCk(n, k):
        return list(itertools.combinations(range(1, n + 1), k))

    proposed_ops = []

    for o in nCk(len(V), k):
        if op_retains_Q(Q, v2descendants, o):
            if get_len_post_ops(v2len, total_length, v2descendants, o) < char_budget:
                proposed_ops.append(o)

    return proposed_ops


def seq2cunks(seq):
    '''
    e.g. seq = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 15, 16, 21, 27, 28, 29, 30, 31, 32, 33, 34, 35]

    output = chunks:list  chunks 

    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    [14, 15, 16]
    [21]
    [27, 28, 29, 30, 31, 32, 33, 34]
    '''
    chunks = []

    chunk = [seq[0]]  # first chunk

    for sno, s in enumerate(seq[1:-1]):
        this = seq[sno]
        next_ = seq[sno + 1]
        if this + 1 == next_:
            chunk.append(s)
        else:
            chunks.append(chunk)
            chunk = list()
            chunk.append(s)

    # deal with last one
    if seq[-1] == chunk[-1] + 1:
        chunk.append(seq[-1])
        chunks.append(chunk)
    else:
        chunks.append(chunk)
        chunks.append([seq[-1]])

    return chunks


def pretty_print(deleted: list, sentence: dict):

    included = [o["index"]
                for o in sentence["tokens"] if o['index'] not in deleted]

    char_start = sentence["tokens"][0]['characterOffsetBegin']

    chunks = seq2cunks(included)

    sentence_max = max([p["index"] for p in sentence["tokens"]])

    out = []

    for chunkno, chunk in enumerate(chunks):
        s = min(chunk)
        e = max(chunk)
        stok = [o["characterOffsetBegin"]
                for o in sentence["tokens"] if o["index"] == s][0]
        etok = [o["characterOffsetEnd"]
                for o in sentence["tokens"] if o["index"] == e][0]

        chunk_s = sentence['orig'][stok - char_start: etok - char_start]

        if chunk_s[0] in PUNCT and chunkno > 0 and len(chunk) != 1:
            chunk_s = chunk_s[2:]

        if len(chunk_s) > 0:
            if chunk_s[-1] in PUNCT and len(chunk) != 1:
                chunk_s = chunk_s[0:-1]

            if len(chunk) == 1:  # skip pure punct
                word = [o["word"]
                        for o in sentence["tokens"] if o["index"] == s][0]
                if word not in PUNCT:
                    out.append(chunk_s)
            else:
                out.append(chunk_s)

    ou = "...".join(out)

    if min(included) > 1:
        ou = "..." + ou

    max_included = max([o['index'] for o in sentence["tokens"]
                        if o['index'] not in deleted and o["word"] not in PUNCT])

    if max_included < sentence_max:
        ou = ou + "..."

    return ou


def count_internal_ellipses(deleted):
    elipses = 0

    for dno, d in enumerate(deleted):
        if dno < len(deleted) - 1:
            if deleted[dno + 1] == d + 1:
                pass
            else:
                elipses += 1
    return elipses


def op2deleted(v2descendants, ops):
    return [v for op in ops for v in v2descendants[op]]


def load_data(fn="min.jsonl"):
    all_ = []
    with open(fn, "r") as inf:
        for i in inf:
            i = json.loads(i)
            for s in i["sentences"]:
                first = s["tokens"][0]['characterOffsetBegin']
                last = s["tokens"][-1]['characterOffsetEnd']
                s["orig"] = i['orig'][first:last]
                toks = s["tokens"]
                words = [o["word"] for o in toks]
                if "Aristide" in words and "Cedras" in words:
                    all_.append(s)

    return all_


def get_tf(term, tfs, supress_warning=True):
    if term in tfs:
        return tfs[term]
    else:
        if not supress_warning:
            print("[*] tf warning {}".format(term))
        return 1


def get_df(term, dfs):
    if term in dfs:
        return dfs[term]
    else:
        print("[*] df warning {}".format(term))
        return 1


def compress_top_down(sentence, Q: list,
                      char_budget: int,
                      tfs: dict,
                      dfs: dict,
                      enumeration_limit: int = 4,
                      supress_warning: bool = False) -> list:

    Q = get_Q_indexes(sentence, Q)

    v2descendants = getv2descendants(sentence)

    V = set([o["word"] for o in sentence["tokens"]])

    v2len = {k["index"]: len(k["word"]) for k in sentence["tokens"]}

    total_length = sum(v2len.values()) + len(v2len) - \
        1  # -1 cuz missing a space

    char_budget = 125

    for k in range(1, enumeration_limit):
        k_ops = getAllPossibleKOps(v2len,
                                   v2descendants,
                                   V,
                                   k=k,
                                   Q=Q,
                                   total_length=total_length,
                                   char_budget=char_budget)

        possibles = []

        for ops in k_ops:
            deleted = op2deleted(v2descendants, ops)

            possibles.append(deleted)

        def score_possible(p):
            toks = [o["word"] for o in sentence['tokens'] if o["index"] in p]
            out = 0
            for t in toks:
                tf = get_tf(t, tfs, supress_warning=True)
                idf = 1/get_df(t, dfs)
                out += tf * idf
            return out

        if len(k_ops) > 0:
            possibles.sort(key=score_possible, reverse=True)
            return possibles[0]
            break
    return []


if __name__ == "__main__":

    with open("just_queried.tf", "r") as inf:
        tfs = json.load(inf)

    with open("corpus.df", "r") as inf:
        dfs = json.load(inf)

    all_ = load_data()[151:158]
    c = 0
    for sentence in tqdm(all_):

        deleted = compress_top_down(
            sentence, Q=["Aristide"], dfs=dfs, tfs=tfs, char_budget=125)
        print("*", c)
        print(sentence['orig'])
        print(pretty_print(deleted=deleted, sentence=sentence))
        c += 1
