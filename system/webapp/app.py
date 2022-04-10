import sys

sys.path.append("..")
sys.path.append("../..")

import copy
import math
import pickle
import jinja2
import datetime
import functools
import logging
import hashlib
import socket
import re
import uuid
import gzip
import json

from flask import Flask, request
from flask import url_for
from jinja2 import Environment, PackageLoader, select_autoescape
from jinja2 import Environment, PackageLoader, select_autoescape
from flask_caching import Cache
from tqdm import tqdm
from rsum.use_rsum import RelationshipSnippetMaker
from compression.fast_compression import compress_top_down, pretty_print
from collections import defaultdict
from compression.fast_compression import PUNCT


app = Flask(__name__)
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

templateLoader = jinja2.FileSystemLoader( searchpath="../all_templates/templates/" )
templateEnv = jinja2.Environment( loader=templateLoader )
doc_fn = "first.html"
template = templateEnv.get_template( doc_fn )

CHAR_BUDGET = 90


# https://colorbrewer2.org/#type=diverging&scheme=PRGn&n=11
diverging = {"QCOLOR": "#762a83",
             "FCOLOR": "#1b7837",
             "READCOLOR": "silver",
             "CORPUSCOLOR": "black",
             "SAVEDCOLOR": "#B32D23",
             "QUERYBARCOLOR": "#EAEFF2",
             "UNREADCOLOR": "black"}


ourcolor = diverging

QCOLOR = ourcolor['QCOLOR']
FCOLOR = ourcolor['FCOLOR']
READCOLOR = ourcolor['READCOLOR']
UNREADCOLOR = ourcolor['UNREADCOLOR']
CORPUSCOLOR = ourcolor['CORPUSCOLOR']
SAVEDCOLOR = ourcolor["SAVEDCOLOR"]
QUERYBARCOLOR = ourcolor["QUERYBARCOLOR"]



tf = defaultdict(int)

subcorpus2n = None  # {"drugs": 963, "education": 2104, "technology": 997}


def mention2raw(mention, grafs):
    grafno = mention["grafno"]
    graf = grafs[grafno]
    return graf[mention['start_char']:mention['end_char']]


def reset_tf():
    for t in tf:
        tf[t] = 0


def format_pd(pubdate):
    return pubdate.strftime("%b %d, %Y")


@app.route("/prompt", methods=["GET", "POST"])
def get_prompt():
    return env.get_template('prompt.html').render()


@app.route("/get_guid", methods=['GET', 'POST'])
def get_guid():
    return str(uuid.uuid4())


@app.route("/count_corpus", methods=['GET', 'POST'])
def count_corpus():

    c = request.args.get('subcorpus')

    items = list(loaded[c]["hl2pd"].items())

    items.sort(key=lambda x: datetime.datetime.strptime(x[1], '%Y%m%d'))

    hl = items[0][0]

    return {"count": str(len(items)),
            "pd": items[0][1],
            "hl": hl}


@app.route("/log_ui", methods=['GET', 'POST'])
def log_ui():
    logging.info("log_ui|||" + json.dumps(request.json))
    return ""


def format_Q(q, txt, color=QCOLOR,
             backgroundColor="white",
             bold=True, mention_no=None,
             sentence_no=None, grafno=None):

    if q.lower() not in txt.lower():
        '''early exit for speed'''
        return txt

    bold_str = "font-weight:bold;" if bold else ""
    sub_string = '<span style="color:' + color + ';' + bold_str + \
        'background-color:' + backgroundColor + '" class="highlight">' + q + '</span>'
    is_query_mention = False

    if(backgroundColor == "white"):
        sub_string = '<span class="querymention" style="color:' + \
            color + ';font-weight:bold' + '">' + q + '</span>'
        is_query_mention = True

    if(mention_no is not None):
        sub_string = sub_string.replace(
            '<span ', '<span data-sentence_no="{}" data-grafno="{}" data-mention-index="{}" class="docviewermention" id="docviewermentionN{}" '.format(sentence_no, grafno, mention_no, mention_no))

    def escapeRegex(q):
        '''
        For now, just fix dollar signs in q. Any regex chars will screw up the in insert w/o this step
        e.g. "I was doing $50 or $75 a day in drugs and" => "I was doing \$50 or \$75 a day in drugs and"
        '''
        return q.replace("$", "\$").replace("(", "\(").replace(")", "\)")

    q = escapeRegex(q)

    qs = q if not is_query_mention else "\\b" + q + "\\b"

    replaced, n = re.subn(q, sub_string, txt)

    is_query_mention = False

    if(n == 0):  # handle lower cased matches
        if q in txt.lower():
            sub_string = '<span style="color:' + color + ';' + bold_str + 'background-color:' + \
                backgroundColor + '" class="highlight">' + \
                q[0].upper() + q[1:] + '</span>'
            if(backgroundColor == "white"):
                sub_string = '<span class="querymention" style="color:' + color + \
                    ';font-weight:bold' + '">' + \
                    q[0].upper() + q[1:] + '</span>'
                is_query_mention = True
            if(mention_no is not None):
                sub_string = sub_string.replace(
                    '<span ', '<span data-sentence_no="{}" data-grafno="{}" data-mention-index="{}" class="docviewermention" id="docviewermentionN{}" '.format(sentence_no, grafno, mention_no, mention_no))
            # "\\b" + q[0].upper() + q[1:] + "\\b"
            qs = q[0].upper() + q[1:] if not is_query_mention else "\\b" + \
                q[0].upper() + q[1:] + "\\b"

            replaced = re.sub(qs, sub_string, txt)

    ou = re.sub('\.{4,}', '...', replaced)
    ou = ou.replace('\\"', '"')

    return ou.replace("\\", " ")


def get_sentence(subcorpus, hl, sno, loaded):
    hlhash = hashlib.sha256(hl.encode()).hexdigest()

    return loaded[subcorpus]["all_files"]["cache/{}".format(subcorpus) + "." + hlhash + ".sno" + str(sno)]


def get_start_and_end_characters(sentence, deleted):
    included = [o["index"] for o in sentence["tokens"]
                if o['index'] not in deleted and o["word"] not in PUNCT]
    included.sort()

    start = included[0]
    end = included[-1]

    start_char = [o['characterOffsetBegin']
                  for o in sentence['tokens'] if o["index"] == start][0]
    end_char = [o['characterOffsetEnd']
                for o in sentence['tokens'] if o["index"] == end][0]
    return start_char, end_char


def package_standard_snippet(sno, hl, subcorpus, q, tf, loaded, f=None, color=QCOLOR, char_budget=CHAR_BUDGET):
    '''
    # inputs
        sno: sentence number
        hl: a headline
        subcorpus: e.g. drugs
        q: e.g. Clinton
        char_budget: size of the snippet, 80 is based on 13' laptop

    # returns
        a formatted snippet
    '''

    fl = get_sentence(subcorpus, hl, sno, loaded=loaded)

    ix = fl["orig"].lower().index(q)

    if f is None:
        Q = [q]
    else:
        Q = [q, f]

    if f is not None:
        supress_warning = True
    else:
        supress_warning = False

    if q == subcorpus:  # on app load
        supress_warning = True
    else:
        supress_warning = False

    deleted = compress_top_down(sentence=fl,
                                Q=Q,
                                char_budget=char_budget,
                                tfs=tf,
                                dfs=loaded[subcorpus]['df'],
                                supress_warning=supress_warning,
                                enumeration_limit=3)

    # print("ok", deleted)

    # compression top down will default to deleting 0 tokens
    snippet = pretty_print(deleted=deleted, sentence=fl)

    start_char, end_char = get_start_and_end_characters(
        sentence=fl, deleted=deleted)

    raw = copy.copy(snippet)

    # print('ij2', len(snippet), snippet)
    method = "clause_deletion"

    if len(snippet) > char_budget:

        method = "windowing"
        first_tok_char_ix = fl["tokens"][0]["characterOffsetBegin"]

        # blah blah blah. [char 23] Some more blab Q [index 41] and more stuff #

        ix = fl["orig"].lower().index(q) + first_tok_char_ix

        diff = round(char_budget/2)
        start_char = max(ix - diff, first_tok_char_ix)
        end_char = min(
            ix + diff + 1, len(fl["orig"].lower()) + first_tok_char_ix)

        new_start = False

        for t in fl["tokens"]:
            # this is to avoid token cut offs mid token

            # I think second condition need to be a greater than not greater/equal
            # b/c start char could be exactly equal to t['characterOffsetBegin'] in which case
            # you don't need an update
            if(int(t['characterOffsetEnd']) >= int(start_char) > int(t['characterOffsetBegin'])):
                start_char = t['characterOffsetEnd'] - first_tok_char_ix
                new_start = True
                # print('fin')
            #print(t['characterOffsetBegin'], end_char, t['characterOffsetEnd'])
            if(int(t['characterOffsetBegin']) <= int(end_char) <= int(t['characterOffsetEnd'])):
                end_char = t['characterOffsetBegin'] - first_tok_char_ix
                if not new_start:  # adjust the start char
                    start_char -= first_tok_char_ix

        # +1 here or you mess up the loop

        st = start_char + 1 if new_start else start_char

        raw = fl["orig"][st:end_char]

        # print('i0i', raw, st, end_char)

        # annoying that raw gets the ... but so it goes
        if st == 0:
            raw = raw + " ..."
        else:
            raw = " ..." + raw + " ..."

        formatted = "..." + fl["orig"][start_char:end_char] + "..."

        start_char += first_tok_char_ix
        end_char += first_tok_char_ix
        if(new_start):
            start_char += 1  # to account for space at end of token

    formatted = format_Q(q, raw.replace(
        "\\n", " ").replace("\\", ''), color=color)

    out = {"method": method, "formatted": formatted, "raw": raw, 'start_char': start_char,
           "end_char": end_char, "deleted": deleted, "sentence_no": sno}

    return out


def get_all_mentions_in_doc_ignore_f(hl, q, subcorpus, color):
    '''get all mentions of Q in doc, w/o filter'''
    sents = loaded[subcorpus]["hl2word2sentence"][hl][q]

    all_mentions = []

    # print("ii", len(sents))
    for sno in set(sents):
        sentence = get_sentence(subcorpus, hl, sno, loaded=loaded)

        with open("/tmp/a", "w") as of:
            json.dump(sentence, of)

        snip = package_standard_snippet(sno=sno, hl=hl, color=color, loaded=loaded,
                                        tf=tf, subcorpus=subcorpus, q=q)

        # print('**', q, sentence['orig'])
        all_mentions.append({"snippet": snip["formatted"],
                             "raw": snip["raw"],
                             "deleted": snip["deleted"],
                             "start_char": snip["start_char"],
                             "end_char": snip["end_char"],
                             'method': snip["method"],
                             "sentence_no": sno,
                             "sentence": sentence,  # comment out to speed up this is just for experiment
                             "grafno": sentence["grafno"]})

    # print("**9", len(all_mentions))
    return all_mentions


def get_sentences_mentioning_q_and_f(q, f, hl, subcorpus, loaded):

    sents_q = loaded[subcorpus]["hl2word2sentence"][hl][q]

    try:
        sents_f = loaded[subcorpus]["hl2word2sentence"][hl][f]
    except KeyError:  # f may be selected, but doc has no mentions of f in it
        sents_f = []

    return set(sents_q) & set(sents_f)


def get_sentences_mentioning_f(q, f, hl, subcorpus):

    try:
        sents_f = loaded[subcorpus]["hl2word2sentence"][hl][f]
    except KeyError:  # f may be selected, but doc has no mentions of f in it
        sents_f = []

    return set(sents_f)


def get_sentences_mentioning_q_or_f(q, f, hl, subcorpus):

    sents_q = loaded[subcorpus]["hl2word2sentence"][hl][q]

    try:
        sents_f = loaded[subcorpus]["hl2word2sentence"][hl][f]
    except KeyError:  # f may be selected, but doc has no mentions of f in it
        sents_f = []

    return set(sents_q) | set(sents_f)


def get_all_mentions_in_doc_with_f(hl, q, f, subcorpus, loaded, char_budget=CHAR_BUDGET):
    '''get all mentions of Q in doc, w/o filter'''
    sents_q = loaded[subcorpus]["hl2word2sentence"][hl][q]

    try:
        sents_f = loaded[subcorpus]["hl2word2sentence"][hl][f]
    except KeyError:  # f may be selected, but doc has no mentions of f in it
        sents_f = []

    all_mentions = []

    both = get_sentences_mentioning_q_and_f(q, f, hl, subcorpus, loaded)

    just_f = set(i for i in sents_f if i not in both)

    just_q = set(i for i in sents_q if i not in both)

    for sno in just_q:

        sentence = get_sentence(subcorpus, hl, sno, loaded=loaded)
        snippet = package_standard_snippet(sno=sno, hl=hl, loaded=loaded,
                                           subcorpus=subcorpus, q=q, tf=tf,
                                           color=QCOLOR)
        all_mentions.append({"snippet": snippet["formatted"],
                             'raw': snippet["raw"],
                             'sentence_no': sno,
                             'method': snippet["method"],
                             'start_char': snippet['start_char'],
                             'end_char': snippet['end_char'],
                             'deleted': snippet['deleted'],
                             'grafno': sentence["grafno"]})

    for sno in just_f:

        sentence = get_sentence(subcorpus, hl, sno, loaded=loaded)
        snippet = package_standard_snippet(sno=sno, hl=hl, loaded=loaded,
                                           subcorpus=subcorpus, q=f, tf=tf,
                                           color=FCOLOR)
        all_mentions.append({"snippet": snippet["formatted"],
                             'raw': snippet["raw"],
                             'sentence_no': sno,
                             'method': snippet["method"],
                             'start_char': snippet['start_char'],
                             'end_char': snippet['end_char'],
                             'deleted': snippet['deleted'],
                             'grafno': sentence["grafno"]})

    rel_summarizer = get_rs()
    for sno in both:
        hlhash = hashlib.sha256(hl.encode()).hexdigest()
        sentence = loaded[subcorpus]["all_files"]["cache/{}".format(
            subcorpus) + "." + hlhash + ".sno" + str(sno)]
        assert char_budget is not None
        sentence_is_relational = rel_summarizer.has_a_relational_snippet(
            sentence, q=q, f=f, charbudget=char_budget)

        if(sentence_is_relational):  # this also checks for char_budget
            prob, cix = rel_summarizer.get_probs_and_indexes(sentence, q, f)
            raw = rel_summarizer.sentence2snippet(sentence, cix)
            cix.sort()
            snippet = copy.copy(raw).replace("\\n", " ").replace("\\", '')
            snippet = format_Q(f, snippet, color=FCOLOR)
            snippet = format_Q(q, snippet, color=QCOLOR)
            deleted = cix
            formatted = copy.copy(snippet)
            start_char = [o["characterOffsetBegin"]
                          for o in sentence["tokens"] if o["index"] == cix[0]][0]
            end_char = [o["characterOffsetEnd"]
                        for o in sentence["tokens"] if o["index"] == cix[-1]][0]
            method = "rsum"
        else:
            # subcorpus
            snippet = package_standard_snippet(sno=sno, hl=hl, loaded=loaded,
                                               subcorpus=subcorpus, q=q, f=f, tf=tf,
                                               color=QCOLOR)
            deleted = snippet['deleted']
            method = snippet["method"]
            raw = copy.copy(snippet["raw"])
            formatted = format_Q(f, snippet["formatted"], color=FCOLOR)
            start_char = snippet["start_char"]
            end_char = snippet["end_char"]

        all_mentions.append({"snippet": formatted,
                             'raw': raw,
                             "sentence_no": sno,
                             'deleted': deleted,
                             'method': method,
                             'start_char': start_char,
                             'end_char': end_char,
                             'grafno': sentence["grafno"]})

    return all_mentions


def hl2tf(subcorpus, hls, q):
    tf2 = defaultdict(int)
    for h in tqdm(hls):
        # list of ints

        sents = loaded[subcorpus]["hl2word2sentence"][h][q]

        for sno in sents:
            hlhash = hashlib.sha256(h.encode()).hexdigest()
            sentence = loaded[subcorpus]["all_files"]["cache/{}".format(
                subcorpus) + "." + hlhash + ".sno" + str(sno)]
            for t in sentence["tokens"]:
                tf2[t['word']] += 1
    return tf2


@app.route("/hl2mentions", methods=['GET', 'POST'])
def hl2mentions():
    '''just shows the first mention as a snippet'''
    q = request.args.get('q').lower()

    subcorpus = request.args.get('subcorpus')

    init_bit = request.args.get('init_bit') == "true"

    reset_tf()  # important! reset term freq on requery

    if q not in loaded[subcorpus]["word2hl"]:
        return json.dumps({"hl2mentions": {}, "hl2pd": {}})

    hls = list(set(loaded[subcorpus]["word2hl"][q]))

    tf = hl2tf(subcorpus=subcorpus, hls=hls, q=q)

    # special case for intro mode b/c
    if(q == subcorpus):
        for d in loaded[subcorpus]['df']:
            tf[d] = 1

    out = {}
    hl2pd_out = {}

    for h in tqdm(hls):
        sents = loaded[subcorpus]["hl2word2sentence"][h][q]
        sno = sents[0]
        sentence = get_sentence(subcorpus=subcorpus,
                                hl=h, sno=sno, loaded=loaded)
        color = QCOLOR
        if(q.lower() == subcorpus.lower() and not init_bit):
            color = CORPUSCOLOR

        snippet = package_standard_snippet(sno=sno, hl=h, subcorpus=subcorpus, loaded=loaded,
                                           color=color, q=q, tf=tf)
        out[h] = {'snippet': snippet["formatted"], 'deleted': snippet['deleted'],
                  # this is needed for paper writing ah may 3 21
                  'method': snippet['method'],
                  "sentence_no": snippet["sentence_no"], "grafno": sentence["grafno"]}
        hl2pd_out[h] = loaded[subcorpus]["hl2pd"][h]

    with open("hl.package.for.paper", "w") as of:  # added may 3 2021 for paper writing ah
        ou = {"headlines": out, 'q': q}
        of.write(json.dumps(ou))

    return json.dumps({"hl2mentions": out, "hl2pd": hl2pd_out})


@app.route("/get_doc", methods=['GET', 'POST'])
def get_doc():

    hl = request.args.get('hl')
    q = request.args.get('q').lower()
    f = request.args.get('f').lower()
    init_bit = request.args.get('init_bit') == "true"
    subcorpus = request.args.get('subcorpus')

    hlhash = hashlib.sha256(hl.encode()).hexdigest()

    def has_w(s, w):  # case insensitive
        return w.lower() in [i["word"].lower() for i in s["tokens"]]

    with open("cache/{}.{}".format(subcorpus, hlhash), "r") as inf:
        dt = json.load(inf)

        orig = dt["orig"]

        # this is not as concise as possible but clearer to read
        if len(f) > 0:
            sentences_ = [s for s in dt["sentences"]
                          if (has_w(s, q) or has_w(s, f))]
        else:
            sentences_ = [s for s in dt["sentences"] if has_w(s, q)]

        has_f = sum(1 for s in sentences_ if has_w(s, f))

        has_q = sum(1 for s in sentences_ if has_w(s, q))

        color = CORPUSCOLOR

        if q.lower() != subcorpus.lower() or init_bit:
            color = QCOLOR
            # print("dinf")

        grafs = [j for j in orig.split("$$$") if len(j) > 0]

        if len(f) > 0:
            all_mentions = get_all_mentions_in_doc_with_f(
                hl, q, f, subcorpus, loaded)
        else:
            all_mentions = get_all_mentions_in_doc_ignore_f(
                hl, q, subcorpus, color)

        # need to sort by sentence no (if F is set)
        all_mentions.sort(key=lambda x: x["sentence_no"])

        # print("**i", all_mentions[0]["raw"])

        # note: this line *must* come after all mentions are sorted
        raws = [mention2raw(mention, grafs)
                for mention_no, mention in enumerate(all_mentions)]

        # mention formatting must come first
        for mention_no, mention in enumerate(all_mentions):

            raw = raws[mention_no]
            grafno = mention['grafno']
            grafs[grafno] = format_Q(raw, grafs[grafno], bold=False,
                                     color="black",
                                     backgroundColor="#fffa75",
                                     sentence_no=mention["sentence_no"],
                                     mention_no=mention_no,
                                     grafno=mention['grafno'])

        # format Q
        grafs_q = [format_Q(q, graf, color=color) for graf in grafs]
        all_grafs = grafs_q

        # format F
        if len(f) > 0:
            grafs_f = [format_Q(f, graf, FCOLOR, sentence_no=mention["sentence_no"],
                                grafno=mention['grafno']).replace("\\n", "<br>") for graf in all_grafs]
            all_grafs = grafs_f

        def split_graf(d):
            if "data-sentence_no" in d:
                ou = []
                for o in re.findall("<span data-sentence_no.+<span.+/span>", d):
                    first = d[0:d.index(o)]
                    mid = d[d.index(o): d.index(o) + len(o)]
                    end = d[d.index(o) + len(o):]
                    ou = ou + [first, mid, end]
                return ou
            else:
                return [d]

        all_grafs = [
            {"raw": g + "\n", "split": split_graf(g)} for g in all_grafs]

        return {"paragraphs": all_grafs,
                "all_mentions": all_mentions,
                "nmentions_f": has_f,
                "nmentions_q": has_q}


@app.route("/get_q_data2", methods=['GET', 'POST'])
def get_q_data2():

    q = request.args.get('q').lower()
    subcorpus = request.args.get('subcorpus')

    try:
        ou = set(loaded[subcorpus]["word2hl"][q])
    except KeyError:
        ou = []

    hl2nmentions = {}
    hl2extra_mentions = {}

    total = []

    total_for_research_not_ui = []

    for hl in ou:
        pd = loaded[subcorpus]["hl2pd"][hl]
        # note count here is by sentence
        nmentions = len(set(loaded[subcorpus]["hl2word2sentence"][hl][q]))
        out = {"pubdate": pd, "headline": hl, "nmentions": nmentions}
        hl2nmentions[hl] = nmentions
        hl2extra_mentions[hl] = []
        all_mentions = get_all_mentions_in_doc_ignore_f(
            hl, q, subcorpus, color="green")

        # this line for paper research argument not UI
        total_for_research_not_ui = total_for_research_not_ui + all_mentions
        total.append(out)

    # only for computational experiment may 3 21
    with open(q + ".all_mentions", "wb") as of:
        pickle.dump(total_for_research_not_ui, of)

    # important: remember to sort by date
    total.sort(key=lambda x: datetime.datetime.strptime(
        x["pubdate"], '%Y%m%d'))

    return json.dumps({"all_data": total,
                       "hl2nmentions": hl2nmentions,
                       "hl2extra_mentions": hl2extra_mentions})


@functools.lru_cache()
def get_rs():
    print("getting rs object")
    rs = RelationshipSnippetMaker("../rsum/cache/rsum.p")
    return rs


def get_relational_snip(sentences, q, f, subcorpus, loaded, char_budget=CHAR_BUDGET):

    rs = get_rs()

    ou = {}

    ou["pubdate"] = sentences[0]['pubdate']

    has_a_r_snip = False
    mention = sentences[0]["orig"]   # default just use first sentence

    for s in sentences:
        if rs.has_a_relational_snippet(s, q, f, charbudget=CHAR_BUDGET):
            has_a_r_snip = True

    one_hits = []
    if has_a_r_snip:
        mention, sentence, compression_indexes = rs.get_most_relational_snippet(
            sentences, q=q, f=f, charbudget=CHAR_BUDGET)
        assert mention is not None
        grafno = sentence["grafno"]
        sno = sentence["sno"]
        deleted = [o for o in sentence["tokens"]
                   if o["index"] not in compression_indexes]
        '''
        this can happen if there is nothing w/in
        char bugdet but has_a_relational_snippet should catch it
        '''
        method = "rsnip"
    else:
        Q = [q, f]
        for sentence in sentences:
            deleted = compress_top_down(sentence=sentence,
                                        Q=Q,
                                        char_budget=char_budget,
                                        tfs=tf,
                                        dfs=loaded[subcorpus]['df'],
                                        supress_warning=True,
                                        enumeration_limit=3)
            mention = pretty_print(deleted=deleted, sentence=sentence)
            grafno = sentence["grafno"]
            sno = sentence["sno"]
            method = "clause_deletion"
            if q in mention and f in mention:
                break
            else:
                if q in mention or f in mention:
                    one_hits.append({"mention": mention, "grafno": grafno,
                                     "sno": sno, "method": method, "deleted": deleted})
        if len(one_hits) > 1:  # enforce first sentence in doc first
            one_hits = one_hits[0]
            mention, deleted, grafno, sno, method = one_hits["mention"], one_hits[
                "deleted"], one_hits["grafno"], one_hits["sno"], one_hits["method"]

    too_long = False
    if len(mention) > char_budget or len(one_hits) == 0:
        print('[*] warning mention is too long. Something is wrong')
        too_long = True
        max_ = len(mention)

        try:
            q_loc = mention.lower().index(q.lower())
        except:
            q_loc = mention.lower().index(f.lower())

        s = q_loc - int(char_budget/2)
        e = q_loc + int(char_budget/2)
        s = max(s, 0)
        e = min(e, max_)
        mention = mention[s:e] + "..."   # bug fix. code and tex not in line
        method = "windowing"

    mention = format_Q(q, mention)
    mention = format_Q(f, mention, FCOLOR)

    mention = mention.replace(" n n", "")

    mention = re.sub('^n n', '', mention)

    ou['mention'] = {"too_long": too_long, "method": method, "snippet": mention, "has_r_snip": has_a_r_snip,
                     "grafno": grafno, "sentence_no": sno, "deleted": deleted}

    return ou


def load_sentences_from_cache(sentence_numbers, hlhash, subcorpus):
    out = []

    for sentence_number in sentence_numbers:
        fn = "cache/{}.".format(subcorpus) + hlhash + \
            '.sno' + str(sentence_number)
        out.append(loaded[subcorpus]["all_files"][fn])
    return out


@app.route('/get_color', methods=['GET', 'POST'])
def get_color():
    return json.dumps({"readcolor": READCOLOR,
                       "unreadcolor": UNREADCOLOR,
                       "savedcolor": SAVEDCOLOR,
                       "f_color": FCOLOR,
                       "q_color": QCOLOR,
                       "querybarcolor": QUERYBARCOLOR})


@app.route('/query_filtered', methods=['GET', 'POST'])
def query_filtered():

    f = request.args.get('f').lower()
    q = request.args.get('q').lower()
    subcorpus = request.args.get('subcorpus')

    out = []

    if f not in loaded[subcorpus]["word2hl"]:
        print("[*] no hit ", f)
        return json.dumps(out)

    hls = set(loaded[subcorpus]["word2hl"][f]) & set(
        loaded[subcorpus]["word2hl"][q])

    hl2sentences = {}

    if len(hls) == 0:
        return json.dumps(out)
    else:
        for hl in hls:
            sentence_numbers = loaded[subcorpus]["hl2word2sentence"][hl][f]
            hlhash = hashlib.sha256(hl.encode()).hexdigest()
            sentences = load_sentences_from_cache(
                sentence_numbers, hlhash, subcorpus)
            snip = get_relational_snip(sentences=sentences, q=q,
                                       f=f, loaded=loaded,
                                       subcorpus=subcorpus)
            hl2sentences[hl] = sentences
            snip["headline"] = hl
            snip['nmentions'] = sum(
                1 for i in get_sentences_mentioning_q_or_f(q, f, hl, subcorpus))
            snip['nmentions_f'] = sum(
                1 for i in get_sentences_mentioning_f(q, f, hl, subcorpus))
            out.append(snip)

    with open('hls.p', "wb") as of:
        save_this = {"q": q, "f": f, "hls": hls, "subcorpus": subcorpus,
                     "hl2sentences": hl2sentences}
        pickle.dump(save_this, of)

    # run deletion_counter.py to get number for system section of paper. replication.
    with open("out.p", "wb") as of:
        ou = {"out": out, "q": q, "f": f}
        pickle.dump(ou, of)

    return json.dumps(out)


@app.route('/')
def form():
    guid = str(uuid.uuid4())

    fn = "app.min.js"
    fn2 = "app.js"
    a = url_for('static', filename=fn2)

    return template.render(guid=guid,
                           q_color=QCOLOR,
                           f_color=FCOLOR,
                           readcolor=READCOLOR,
                           savedcolor=SAVEDCOLOR,
                           unreadcolor=UNREADCOLOR,
                           js_loc=a[1:])


def get_loaded():

    loaded = defaultdict(dict)

    corpora = [o.replace("\n", "") for o in open("corpora.txt")]
    for cc in corpora:
        print("**", cc)

        with open("cache/{}.df".format(cc), "r") as inf:
            loaded[cc]['df'] = json.load(inf)

        with open("cache/{}.word2bin".format(cc), "r") as inf:
            loaded[cc]["word2bin"] = json.load(inf)

        with open("cache/{}.word2ix".format(cc), "r") as inf:
            loaded[cc]["word2ix_master"] = {
                int(k): v for k, v in json.load(inf).items()}

        with open("cache/{}.bin_and_doc_2_headline".format(cc), "r") as inf:
            loaded[cc]["bin_and_doc_2_headline"] = json.load(inf)

        with open("cache/{}.hl2word2sentence".format(cc), 'r') as inf:
            loaded[cc]["hl2word2sentence"] = json.load(inf)

        with open("cache/{}.hl2pd.json".format(cc), "r") as inf:
            loaded[cc]["hl2pd"] = json.load(inf)

        with open("cache/{}.word2hl.json".format(cc), "r") as inf:
            loaded[cc]["word2hl"] = json.load(inf)

        with gzip.open("cache/{}.all_sno".format(cc), "r") as inf:
            json_bytes = inf.read()
            json_str = json_bytes.decode('utf-8')
            loaded[cc]["all_files"] = json.loads(json_str)
    return loaded


if __name__ == '__main__' or __name__ == "app":

    loaded = get_loaded()

    logging.basicConfig(filename='logs/main.log',
                        level=logging.DEBUG,
                        format='%(asctime)s###%(message)s',
                        datefmt='%m/%d/%Y %I:%M:%S %p')

    IP = "localhost"  # if socket.gethostname() == "dewey" else "hobbes.cs.umass.edu"

    print("running")
    app.run(debug=True, host=IP, port=5010, threaded=True)
