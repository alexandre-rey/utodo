.PHONY: deploy

deploy:
	@echo "Building the project..."
	npm run build

	@echo "Cleaning up old files..."
	ssh ubuntu@193.108.55.253 'rm -rf ~/apps/utodo/public/*'

	@echo "Send the changes to the server..."
	rsync -avz -e 'ssh' ./dist/ ubuntu@193.108.55.253:~/apps/utodo/public/