from datetime import datetime
from tqdm import tqdm as tqdm
from dateparser import parse
from collections import defaultdict

import gzip
import json
import glob
import os
import hashlib


def corpus2df(fn):
    '''fn is a jsonl'''

    df = defaultdict(int)

    with open(fn, "r") as inf:
        for docno, doc in tqdm(enumerate(inf)):
            doc = json.loads(doc)
            doc2toks = set(t["word"].lower() for s in doc["sentences"] for t in s["tokens"])
            for d in doc2toks:
                df[d] += 1

    return dict(df)


def remove_lemmas(s):
    for t in s:
        del t["lemma"]
        del t["originalText"]
        del t["before"]
        del t["after"]
    return s


def build_word_2bins(bins):
    '''UI is organized by panels so you need to know which panel holds a word'''
    word2bin = defaultdict(list)
    word2ix_master = dict()
    bin_and_doc_2_headline = dict()
    hl2word2sentence = dict()  # map, hl => word => sentence
    hl2pd = dict()
    word2hl = defaultdict(set)

    for no, fn in enumerate(bins):
        word2ix = defaultdict(list)

        dt = bins[fn]

        for docno, itm in enumerate(dt):
            hl2word2sentence[itm["headline"]] = defaultdict(list)
            hl2pd[itm['headline']] = itm['pubdate']
            hl = itm['headline']
            for sno, s in enumerate(itm["sentences"]):
                for t in s["tokens"]:
                    word = t["word"].lower() # all lowercase  11/11
                    word2bin[word].append(no)
                    word2ix[word].append(docno)
                    word2hl[word].add(hl)
                    hl2word2sentence[itm["headline"]][word].append(sno)

            bin_and_doc_2_headline["{}-{}".format(no, docno)] = itm["headline"]
        word2ix = {k: list(set(v)) for k, v in word2ix.items()}
        word2ix_master[no] = word2ix

    with open("cache/{}.hl2word2sentence".format(corpus), "w") as of:
        # get to json format
        hl2word2sentence = json.loads(json.dumps(hl2word2sentence))
        json.dump(hl2word2sentence, of)

    with open("cache/{}.hl2pd.json".format(corpus), "w") as of:
        json.dump(hl2pd, of)

    with open("cache/{}.word2hl.json".format(corpus), "w") as of:
        word2hl = {k: list(v) for k, v in word2hl.items()}
        json.dump(dict(word2hl), of)

    with open("cache/{}.bin_and_doc_2_headline".format(corpus), "w") as of:
        json.dump(bin_and_doc_2_headline, of)

    with open("cache/{}.word2bin".format(corpus), "w") as of:
        word2bin = {k: list(set(v)) for k, v in word2bin.items()}
        json.dump(word2bin, of)

    with open("cache/{}.word2ix".format(corpus), "w") as of:
        json.dump(word2ix_master, of)


def get_sorted_bin_names(bins):
    bin_names = list(bins.keys())

    def str2dt(x):
        just_date = x.split("_")[-1] # e.g. Aristide_1987-1
        return parse(just_date)

    bin_names.sort(key=lambda x: str2dt(x))
    return bin_names


def padmo(str_):
    if len(str_) == 1:
        return "0" + str_
    else:
        return str_


def get_docs(fn):

    # crude dedupe by headline. note some headlines are like "NEWS SUMMARY" and repeat on multiple dates
    # it is fine to exclude them in a research system imo, given our focus
    hl_so_far = set()

    with open(fn, "r") as inf:
        for i in tqdm(inf):
            i = json.loads(i)
            if i["headline"] not in hl_so_far:
                if "BEST SELLERS" not in i["headline"]:
                    hl_so_far.add(i["headline"])  # BEST SELLERS = some cleanup for ellen
                    yield(i)


def get_month(doc):
    pd = datetime.strptime(doc["pubdate"], '%Y%m%d')
    return str(pd.year) + "-" + padmo(str(pd.month))


def get_init_bins():
    return [str(i) + "-" + padmo(str(j)) for i in range(1987, 2008) for j in range(1, 13)]


def write_all_files(all_files, corpus):

    print("*** write all files ***")

    with gzip.open("cache/{}.all_sno".format(corpus), "w") as of:
        ou = json.dumps(all_files)
        json_bytes = ou.encode('utf-8')
        of.write(json_bytes)


def reduce_deps(basicDependencies):
    ou = []
    for d in basicDependencies:
        ou.append({'dep': d["dep"],
                   "governor": d["governor"],
                   "dependent": d["dependent"]})
    return ou


if __name__ == "__main__":

    corpora = [o.replace("\n", "") for o in open("corpora.txt")]

    for corpus in corpora:

        for fn in glob.glob("cache/*{}*".format(corpus)):
            os.remove(fn)

        fn = "editorial_" + corpus + ".jsonl"

        '''write document frequencies'''
        with open("cache/{}.df".format(corpus), "w") as of:
            json.dump(corpus2df(fn), of)

        has_mentions = [d for d in get_docs(fn)]

        bin_names = get_init_bins()

        bins = defaultdict(list)

        for dno, doc in enumerate(has_mentions):
            doc["pubdate"] = doc["pubdate"].replace("-", "")
            bin_ = get_month(doc)
            has_mentions[dno]["bin"] = bin_
            bins[bin_].append(has_mentions[dno])

        bin_names = get_sorted_bin_names(bins)

        with open("cache/{}.bin_names".format(corpus), "w") as of:
            json.dump(bin_names, of)

        all_files = {}

        for f in tqdm(bins):
            dt = bins[f]

            for d in dt:

                hlhash = hashlib.sha256(d["headline"].encode()).hexdigest()

                with open("cache/{}.{}".format(corpus, hlhash), "w") as of:
                    json.dump(d, of)

                # write each sentence to a line
                for sno, s in enumerate(d["sentences"]):
                    fn = "cache/{}.{}.sno{}".format(corpus, hlhash, sno)

                    a = [o for o in s["tokens"]]
                    a.sort(key=lambda x: x["index"])
                    first = a[0]
                    last = a[-1]
                    first_char = first["characterOffsetBegin"]
                    last_char = last["characterOffsetEnd"]

                    ou = {"tokens": s["tokens"],
                          "grafno": s["grafno"],
                          "sno": sno,
                          "basicDependencies": s["basicDependencies"],
                          "pubdate": d["pubdate"],
                          "orig": s["orig"],
                          "first_char": first_char,  # these needed for rsum
                          "last_char": last_char}

                    all_files[fn] = ou

        print("*** build_word_2bins ***")  # build an index
        build_word_2bins(bins)

        write_all_files(all_files, corpus)
