Q = "Aristide"
import glob
import json
from tqdm import tqdm as tqdm


def get_leveled_snippets_basic_method(doc, Q, margin, desired_indexes, max_=175):

    all_words = [o["word"] for s in doc["sentences"] for o in s["tokens"]]
    all_tokens = [o for s in doc["sentences"] for o in s["tokens"]]

    ixs = [index for index, value in enumerate(all_words) if value == Q]

    out = []

    for ix in desired_indexes:
        ix = ixs[ix]

        # for margin in [15, 30, 100, 200, 300, 350, 400, 450]:
        #   for i in ixs:
        s = max(ix - margin, 0)
        e = min(ix + margin, len(all_tokens) - 1)
        s = all_tokens[s]['characterOffsetBegin']
        e = all_tokens[e]['characterOffsetEnd']
        snip = doc["orig"][s:e]
        if len(snip) > max_:
            snip = snip[0:max_]
            e = s + max_
        if (s != 0):
            snip = "..." + snip
        if (e < len(doc["orig"])):
            snip = snip + "..."
        out.append(snip)

    return "...".join(out)


if __name__ == "__main__":

    for f in tqdm(fns[4:5]):
        with open(f, "r") as inf:
            bin_ = json.load(inf)
            for dno, doc in enumerate(bin_[0:1]):
                out = get_leveled_snippets_basic_method(f, dno, doc, Q)
                kys = list(out.keys())
                for k in kys:
                    print("**")
                    print(out[k])