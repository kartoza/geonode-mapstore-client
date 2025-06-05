FILE=VERSION
VERSION=`cat $(FILE)`

.PHONY: build geonode package release

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
	cd geonode_mapstore_client/client && npm compile