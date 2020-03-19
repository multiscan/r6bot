KB_USER ?= multiscan

.env: /keybase/private/$(KB_USER)/r6bot.env
	cp $< $@

up: .env
	docker-compose up -d
	@echo "App started"

down:
	docker-compose down

logs:
	docker-compose logs -f

ps:
	docker-compose ps

shell: up
	docker-compose exec node bash

.PHONY: down up logs ps shell

