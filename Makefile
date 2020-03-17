TRAEFIK_DIR ?= $(HOME)/Projects/traefik
KB_USER ?= multiscan

.env: /keybase/private/$(KB_USER)/r6bot.env
	cp $< $@

up: .env traefik
	docker-compose up -d
	@echo "App started"

down:
	docker-compose down

logs:
	docker-compose logs -f

ps:
	@docker-compose ps
	@./dev-script/isidor.sh status

shell: up
	docker-compose exec lhd-app bash

traefik:
	cd $(TRAEFIK_DIR) && make up

.PHONY: down up logs ps shell traefik

