from jinja2 import Template

with open('reading_list_table.html', "r") as inf:
    dt = inf.read()

template = Template(dt)


print(template.render(N_tokens_all_documents=3, N_tokens_all_sentences=44, N_tokens_all_shortenings=9))