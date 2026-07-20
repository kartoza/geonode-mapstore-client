FILE=VERSION
VERSION=`cat $(FILE)`

.PHONY: build geonode package release clean

build:
	npm run dist

geonode: build
	npm run geonode:deploy

package: geonode
	python setup.py sdist bdist_wheel

release: package
	twine upload dist/django-geonode-mapstore-client-$(VERSION).tar.gz

install:
	cd geonode_mapstore_client/client && npm install --legacy-peer-deps

start:
	cd geonode_mapstore_client/client && npm start

compile:
	cd geonode_mapstore_client/client && npm run compile

clean:
	rm -rf geonode_mapstore_client/client/node_modules
	rm -f geonode_mapstore_client/client/package-lock.json
	rm -rf geonode_mapstore_client/client/MapStore2/node_modules
	rm -f geonode_mapstore_client/client/MapStore2/package-lock.json
