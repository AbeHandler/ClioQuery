import pandas as pd
import subprocess
import random
import numpy as np
from tqdm import tqdm


# Make the bootstrap samples for the plot of this in the paper

def make_bootstrap_samples():
    df = pd.read_csv("turk.csv")

    c1 = df[df["condition"] == "CQ"]
    c2 = df[df["condition"] == "IR"]

    cqmeans = []
    irmeans = []

    # for replicability. added seed 20220111
    random.seed(42)
    randomlist = random.sample(range(0, 10000000), 5000)

    for i in range(2500):
        bootstrap_sample_mean = np.mean(c1["total_correct"].sample(
            replace=True, random_state=randomlist[i], n=len(c1["total_correct"])))
        cqmeans.append(bootstrap_sample_mean)

    for i in range(2500):
        bootstrap_sample_mean = np.mean(c2["total_correct"].sample(
            replace=True, random_state=randomlist[i * 2], n=len(c2["total_correct"])))
        irmeans.append(bootstrap_sample_mean)

    source = pd.DataFrame({
        'CQ': cqmeans,
        'IR': irmeans
    })

    source.melt().to_csv("sample_means.csv", index=False)

# Perform significance testing


def tstat(_z, _y):
    n = np.mean(_z) - np.mean(_y)
    d = np.sqrt(np.var(_z)/len(_z) + np.var(_y)/len(_y))
    return n/d


def algo162(zreal, yreal, B):

    tobs = tstat(zreal, yreal)

    xbar = np.mean(np.hstack([zreal.to_numpy(), yreal.to_numpy()]))
    fhat = pd.DataFrame({"z": zreal - np.mean(zreal) + xbar})
    ghat = pd.DataFrame({"y": yreal - np.mean(yreal) + xbar})

    # this is for replicability. The numbers are very similar w.o seed
    # AH 20220111
    random.seed(42)
    randomlist = random.sample(range(0, 10000000), B * 2)

    c = 0
    for b in tqdm(range(B)):
        seed = randomlist[b * 2]
        seed2 = randomlist[(b * 2) - 1]
        z = fhat.sample(n=len(fhat), random_state=seed, replace=True)
        y = ghat.sample(n=len(ghat), random_state=seed2, replace=True)
        tp = tstat(z["z"].to_list(), y["y"].to_list())
        if tp >= tobs:
            c += 1
    p = c/B
    return p


if __name__ == "__main__":

    make_bootstrap_samples()

    df = pd.read_csv("turk.csv")

    B = 100000

    # get pvalue for all workers
    p_all = algo162(df[df["condition"] == "CQ"]["total_correct"],
                    df[df["condition"] == "IR"]["total_correct"], B=B)

    with open("p_all.txt", "w") as of:
        of.write("{:.3f}".format(p_all))
    print("All workers p value={:.3f}".format(p_all))

    # get pvalue for engaged workers
    attentivecq = df[(df["condition"] == "CQ") & (
        df["engaged"] == "Engaged")]["total_correct"]
    attentiveir = df[(df["condition"] == "IR") & (
        df["engaged"] == "Engaged")]["total_correct"]
    p_attentive = algo162(attentivecq, attentiveir, B=B)
    with open("p_attentive.txt", "w") as of:
        of.write("{:.3f}".format(p_attentive))

    print("Attentive workers p value={:.3f}".format(p_attentive))

    subprocess.call("./run_R.sh")
