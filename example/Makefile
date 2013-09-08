JSRUNJAR=/opt/jsdoc_toolkit-2.4.0/jsdoc-toolkit/jsrun.jar
JSRUNJS=/opt/jsdoc_toolkit-2.4.0/jsdoc-toolkit/app/run.js

TEMPLATE=../docstrape_tmpl

SRCPATH=./src
SRCPATH_SSJS=$(SRCPATH)/Ape_Server/modules
SRCPATH_JSF=$(SRCPATH)/Ape_Jsf
FILES_SSJS=$(shell find $(SRCPATH_SSJS)/*.c -type f )
FILES_JSF=$(shell find $(SRCPATH_JSF)/Source/ -type f -name *.js -not -name mootools-core.js) $(shell find $(SRCPATH_JSF)/Clients/ -type f -name *.js -not -name mootools-core.js)

BASE_URL=http://www.ape-project.org
WIKI_LINK_ROOT=$(BASE_URL)/wiki
WIKI_URL=$(WIKI_LINK_ROOT)/index.php?page=usercomment
WIKI_TEXT=Go to the wiki for this item

all: server_online client_online server_offline client_offline

server_online: $(FILES_SSJS)
	java -jar $(JSRUNJAR) $(JSRUNJS) $(FILES_SSJS) -t=$(TEMPLATE) -d=./output/online/server/ -x=c,h -n -s $(JSDOC_WEB_VARIABLES) --define="topic:server" --define='wikiurl:$(WIKI_URL)' --define='wikitext:$(WIKI_TEXT)' --define='base_url:$(BASE_URL)' --define='wikiicon:/static/img/base/wikiape.png'                            --define="prefix:online" --define='wiki:$(WIKI_LINK_ROOT)'

client_online: $(FILES_JSF)
	java -jar $(JSRUNJAR) $(JSRUNJS) $(FILES_JSF) -t=$(TEMPLATE) -d=./output/online/client/ -  x=js -n -s $(JSDOC_WEB_VARIABLES)  --define="topic:client"--define='wikiurl:$(WIKI_URL)' --define='wikitext:$(WIKI_TEXT)' --define='base_url:$(BASE_URL)' --define='wikiicon:/static/img/base/wikiape.png'                            --define="prefix:online" --define='wiki:$(WIKI_LINK_ROOT)'

server_offline: $(FILES_SSJS)
	java -jar $(JSRUNJAR) $(JSRUNJS) $(FILES_SSJS) -t=$(TEMPLATE) -d=./output/offline/server/ -x=c,h -n -s $(JSDOC_WEB_VARIABLES) --define="topic:server" --define='wikiurl:$(WIKI_URL)' --define='wikitext:$(WIKI_TEXT)' --define='base_url:./'          --define='wikiicon:http://upload.wikimedia.org/wikipedia/en/b/bc/Wiki.png'

client_offline: $(FILES_JSF)
	java -jar $(JSRUNJAR) $(JSRUNJS) $(FILES_JSF) -t=$(TEMPLATE) -d=./output/offline/client/ - x=js -n -s $(JSDOC_WEB_VARIABLES)  --define="topic:client" --define='wikiurl:$(WIKI_URL)' --define='wikitext:$(WIKI_TEXT)' --define='base_url:./'          --define='wikiicon:http://upload.wikimedia.org/wikipedia/en/b/bc/Wiki.png'



.PHONEY: clean

clean:
	rm -rf ./output/
