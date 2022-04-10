# coding: utf-8
import hashlib
import pickle
import json

from jinja2 import Template
from tqdm import tqdm as tqdm
from webapp.app import get_all_mentions_in_doc_with_f
from webapp.app import get_loaded

with open('reading_list_table.html', "r") as inf:
    dt = inf.read()

template = Template(dt)


if __name__ == "__main__":

    with open("hls.p", "rb") as inf:
        dt = pickle.load(inf)

    q = dt["q"]
    f = dt["f"]

    print(q)
    print(f)

    loaded = get_loaded()

    subcorpus = "Salvador"

    N_tokens_all_sentences = 0
    N_tokens_all_documents = 0
    N_tokens_all_shortenings = 0

    for headline in tqdm(dt["hls"]):

        all_mentions = get_all_mentions_in_doc_with_f(headline, q, f,
                                                      subcorpus, loaded)

        sentno2sent = {}
        hlhash = hashlib.sha256(headline.encode()).hexdigest()
        with open("cache/{}.{}".format(subcorpus, hlhash), "r") as inf:
            doc = json.load(inf)
            for sno, d in enumerate(doc["sentences"]):
                N_tokens_all_documents += len(d["tokens"])
                sentno2sent[sno] = d

        for m in all_mentions:
            mention_sentence = sentno2sent[m["sentence_no"]]["tokens"]
            N_tokens_all_sentences += len(mention_sentence)
            N_tokens_all_shortenings += sum(1 for i in mention_sentence if i["index"] not in m["deleted"])


    print(template.render(N_tokens_all_documents="{:,}".format(N_tokens_all_documents),
                          N_tokens_all_sentences="{:,}".format(N_tokens_all_sentences),
                          N_tokens_all_shortenings="{:,}".format(N_tokens_all_shortenings)))

    print("* redution ={:.3}%".format((N_tokens_all_shortenings/N_tokens_all_sentences) * 100))