import json
import numpy as np
import copy
import pickle

from scipy.sparse import hstack
from tqdm import tqdm_notebook as tqdm
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import cross_validate
from sklearn.linear_model import LogisticRegression
from random import shuffle


feature_set = [
    "pos_in_compression",
    "pos_not_in_compression",
    "dep_in_compression",
    "dep_not_in_compression",
]

deps = "basicDependencies"


def featurize(i, compression_indexes):
    i["pos_in_compression"] = [
        o["pos"] for o in i["tokens"] if o["index"] in compression_indexes
    ]
    i["pos_not_in_compression"] = [
        o["pos"] for o in i["tokens"] if o["index"] not in compression_indexes
    ]
    i["dep_in_compression"] = [
        k["dep"]
        for k in i[deps]
        if k["dependent"] in compression_indexes
    ]
    i["dep_not_in_compression"] = [
        k["dep"]
        for k in i[deps]
        if k["dependent"] not in compression_indexes
    ]
    return i


def get_data(fn):
    alls = []
    with open(fn, "r") as inf:
        for i in tqdm(inf):
            i = json.loads(i)
            if i["label"] == 1:
                i["tokens"] = i["tokens"][0:-1]
            featurize(i, i["compression_indexes"])
            alls.append(i)
    return alls


def get_corpora(alls):
    corpora = {}

    for f in feature_set:
        corpora[f] = [" ".join(o[f]) for o in alls]
    return corpora


def get_x_and_y_and_cvs(alls):

    cvs = {}
    corpora = get_corpora(alls)

    for f in feature_set:
        cv = CountVectorizer()
        cv.fit(corpora[f])
        cvs[f] = cv

    X = hstack([cvs[f].transform(corpora[f]) for f in feature_set])
    y = np.asarray([int(o["label"]) for o in alls])

    return X, y, cvs


def demo(sentence, lr):

    feature_set = [
        "pos_in_compression",
        "pos_not_in_compression",
        "dep_in_compression",
        "dep_not_in_compression",
    ]

    three_class = ["PERSON", "ORGANIZATION", "LOCATION"]

    sentence = copy.deepcopy(sentence)

    toks = sentence["tokens"]
    toks.sort(key=lambda x: x["index"])

    ixs = [u["index"] for u in sentence["tokens"] if u["ner"] in three_class]

    shuffle(ixs)
    tk = ixs[:2]
    tk.sort()

    if len(tk) >= 2:
        compression_indexes = [
            o["index"]
            for o in sentence["tokens"]
            if o["index"] >= tk[0] and o["index"] <= tk[1]
        ]

        featurize(sentence, compression_indexes)

        corpora = {}

        for f in feature_set:
            corpora[f] = [" ".join(o[f]) for o in [sentence]]

        X = hstack([cvs[f].transform(corpora[f]) for f in feature_set])

        prob = lr.predict_proba(X)[0][1]

        c = " ".join(
            [j["word"] for j in sentence["tokens"] if
             j["index"] in compression_indexes]
        )

        if len(compression_indexes) > 3 and prob > 0.5:
            print(c, prob)


if __name__ == "__main__":
    fn = "labeled.jsonl"

    alls = get_data(fn)

    X, y, cvs = get_x_and_y_and_cvs(alls)

    """
    # follow tuning from prior paper. tuning does not seem to matter much
    for j in [1]:
        c = 10 ** j
        lr = LogisticRegression(class_weight="balanced", C=c)
        cv_results = cross_validate(lr, X, y, cv=3)
        print(c, np.mean(cv_results["test_score"]), np.mean(y))
    """

    lr = LogisticRegression(class_weight="balanced", C=1)
    lr.fit(X, y)

    with open("cache/rsum.p", "wb") as of:
        pickle.dump({"lr": lr, "cvs": cvs}, of)

    for sentence in alls:
        demo(sentence, lr)
