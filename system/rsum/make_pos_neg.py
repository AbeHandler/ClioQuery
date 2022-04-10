import json
import glob
from tqdm import tqdm as tqdm
from random import shuffle

three_class = ["PERSON", "ORGANIZATION", "LOCATION"]

positives = set()

fns = [fn for fn in glob.glob("sentence-compression/data/*.source")]

pos_out = "labeled.jsonl"

with open(pos_out, "w") as of:

    for fn in fns:
        with open(fn, "r") as inf:
            for i in tqdm(inf):
                if len(i) > 0:
                    i = json.loads(i)
                    s = i["compression_indexes"][0]
                    e = i["compression_indexes"][-1]

                    s = [p for p in i["tokens"] if p["index"] == s][0]
                    e = [p for p in i["tokens"] if p["index"] == e][0]

                    condition = (s["ner"] in three_class and e["ner"] in three_class)

                    #condition = s["pos"][0] == "N" and e["pos"][0] == "N"

                    if condition:
                        i['label'] = 1
                        of.write(json.dumps(i) + "\n")
                    else:
                        toks = i["tokens"]
                        shuffle(toks)
                        t1, t2 = toks[0:2]
                        t1 = t1["index"]
                        t2 = t2["index"]
                        if(abs(t1 - t2) > 6 and abs(t1 - t2) < 30):
                            i["t1"] = min(t1, t2)
                            i["t2"] = max(t1, t2)
                            i['label'] = 0
                            of.write(json.dumps(i) + "\n")
