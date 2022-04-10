import pickle
import gzip
import json
import sys
sys.path.append("..")

from rsum.train_rsum import featurize
from rsum.train_rsum import feature_set
from scipy.sparse import hstack


class RelationshipSnippetMaker(object):
    def __init__(self, relationship_sum_model="cache/rsum.p"):
        with open(relationship_sum_model, "rb") as inf:
            dt = pickle.load(inf)
            lr = dt["lr"]
            cvs = dt["cvs"]
            self.lr = lr
            self.cvs = cvs

    def get_probs_and_indexes(self, sentence, q, f):

        q = [o for o in sentence["tokens"] if o["word"].lower() == q.lower()]
        f = [o for o in sentence["tokens"] if o["word"].lower() == f.lower()]

        if len(q) == 0 or len(f) == 0:
            '''if q and f are not in sentence, just return the sentence'''
            sentence_indexes = [o["index"] for o in sentence["tokens"]]
            return 0, sentence_indexes

        q = q[0]["index"]
        f = f[0]["index"]

        ixs = [q, f]
        ixs.sort()
        s, e = ixs

        compression_indexes = [j for j in range(s, e + 1)]

        featurize(sentence, compression_indexes)

        corpora = {}

        for f in feature_set:
            corpora[f] = [" ".join(o[f]) for o in [sentence]]

        X = hstack([self.cvs[f].transform(corpora[f]) for f in feature_set])

        prob = self.lr.predict_proba(X)[0][1]

        return prob, compression_indexes

    def sentences2rankedcompressions(self, sentences, q, f, charbudget):
        options = []
        for sentence in sentences:
            prob, cix = self.get_probs_and_indexes(sentence, q, f)
            length = self.get_length(cix, sentence)
            if length <= charbudget:
                options.append((prob, cix, sentence))

        options.sort(key=lambda x: x[0], reverse=True)
        return options

    def sentence2snippet(self, sentence, compression_indexes):
        cars = [o for o in sentence["tokens"] if o["index"] in compression_indexes]
        s = cars[0]["characterOffsetBegin"] - sentence['first_char']
        e = cars[-1]["characterOffsetEnd"] - sentence['first_char']
        return sentence["orig"][s:e]

    def get_length(self, cix, sentence):
        cix.sort()
        s = cix[0]
        e = cix[-1]
        t1 = [o['characterOffsetBegin'] for o in sentence["tokens"] if o["index"] == s][0]
        t2 = [o['characterOffsetEnd'] for o in sentence["tokens"] if o["index"] == e][0]
        return t2 - t1

    def has_a_relational_snippet(self, sentence, q, f, charbudget=None):
        '''does this sentence have a relational snippet?'''
        prob, cix = self.get_probs_and_indexes(sentence, q, f)
        length = self.get_length(cix, sentence)

        if charbudget is not None:
            if length > charbudget:
                return False

        if prob > .5:
            return True
        else:
            return False

    def get_most_relational_snippet(self, sentences, q, f, charbudget):
        '''
        This method returns the most relational snippet possible from a set of sentences

        If you want a relational snippet for a specific sentence on demand use has_a_relational_snippet
        '''
        opts = self.sentences2rankedcompressions(sentences, q=q, f=f, charbudget=charbudget)

        if len(opts) > 0:
            prob, compression_indexes, sentence = opts[0]
            return self.sentence2snippet(sentence, compression_indexes), sentence, compression_indexes
        else:
            return None, None, None


if __name__ == "__main__":

    with open("sentences.p", "rb") as inf:
        sentences = pickle.load(inf)

    q = "Clinton"

    f = "Republicans"

    rs = RelationshipSnippetMaker()

    for s in sentences:
        if(rs.has_a_relational_snippet(s, q=q, f=f)):
            prob, cix = rs.get_probs_and_indexes(s, q, f)
            #print(prob, rs.sentence2snippet(s, cix))

    print(rs.get_most_relational_snippet(sentences, q=q, f=f))
