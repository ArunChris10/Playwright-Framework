## PlayWright Automation Framework

This is a IBG automation framework that uses Playwright to automate backend and frontend testcases

For any help in playwright please refer the playwright documentation below

- [Playwright HelpDocs](https://playwright.dev/docs/intro)

### Prerequisites

- Node.js and npm installed on your system
- Visual Studio Code

### Installation

- Clone the repository to your local machine

        git clone https://gecgithub01.walmart.com/IBG/ibg-testscripts-playwright.git

- Install the required dependencies

        npm install
        npx playwright install     ----------version to be installed 1.42.0-------

- To update playwright version use command -> npm install @playwright/test@versionnumber

### Secret Folder

- Please create the following files in a secret folder by executing the commands in the terminal

          echo '{}' > secrets/nexus-users-token.json
          echo '{}' > secrets/ibg-users-token.json
          echo '{}' > secrets/ufm-secrets.json
          echo '{}' > secrets/ibg-user-storagestate.json
          echo '{}' > secrets/ibg-normal-user-storagestate.json 
          echo '{}' > secrets/nexus-user-storagestate.json

- For the token files we don't have to add anything , this will be used during the runtime
- For the ufm-secrets we need to add the lab accounts , please connect with any of the testers to get this data and add it into the file

### Local Test Execution

- Check the configuration in the config files available in the [Playwright Config File](./playwright.config.ts)
- Choose a project from the projects available in that config file
- Open [package.json](package.json) and check the scripts section for the corresponding project name
- Open [.env-cmdrc.json] and update the custom tag with the tag u want to run
- Copy the script that matches with the required project
- For Mac Run the below command after replacing the script name

          APP_NAME=UFM ENV=qa TEST=tag_name npm run <script-name-from-package-json>
          Example- APP_NAME=UFM ENV=qa TEST=custom_tag npm run tests:ufm-tests

- For Windows if that above steps didn't work we need to provide the absolute path for playwright and env-cmd, Hence Run the below command after replacing the config file and project

           ./node_modules/.bin/env-cmd --environments qa ./node_modules/.bin/env-cmd --environments tag ./node_modules/.bin/playwright test --config=configs/ufm.config.ts --project=ufm-be

           Example-  ./node_modules/.bin/env-cmd --environments develop ./node_modules/.bin/env-cmd --environments Get_Historicals ./node_modules/.bin/playwright test --config=configs/ufm.config.ts --project=ufm-be

### Folder Structure

    .
    ├── ...
    ├── secrets
    │   ├── nexus-users-token.json
    │   ├── ibg-users-token.json
    │   ├── ufm-secrets.json
    │   ├── ibg-user-storagestate.json
    │   ├── nexus-user-storagestate.json
    ├── tests
    │   ├── ufm-be              # workstream folders for BE testcases
    │   │   ├── fixtures        # playwright fixture files
    │   │   ├── testcases
    │   │   ├── testdata
    │   │   └── ...             # etc.
    │   ├── ufm-fe              # workstream folders for FE testcases
    │   │   ├── globalsetup     # global files to run
    │   │   ├── pages           # folder containing all pages based on POM
    │   │   ├── testcases
    │   │   ├── testdata
    │   ├── cdf-be              # other workstream folder for BE testcases
    │   │   └── ...
    │   ├── cdf-fe              # other workstream folder for FE testcases
    │   │   └── ...

    ├── .env-cmdrc.json         # Environmental Variables
    ├── .looper.yml             # looper build steps
    ├── plawright.config.ts     # Config file
    ├── package.json            # dependencies and scripts to run
    └── ...

### Self signed Certificate issue

If you are facing any self signed certificate error during API calls then add the trust certificate by refering the below link
[Trust the Walmart Root CA](https://dx.walmart.com/documents/product/DX%20Console/Development-Machine-Setup-08hu0cw1l9#1-trust-the-walmart-root-ca)

        export NODE_EXTRA_CA_CERTS=<path_to_certificate>
