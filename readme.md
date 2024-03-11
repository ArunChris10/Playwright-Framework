## PlayWright API Automation Framework

This is a IBG API automation framework that uses Playwright to automate backend testcases

For any help in playwright APIs please refer the playwright documentation below

 - [Playwright HelpDocs](https://playwright.dev/docs/intro)

### Prerequisites
- Node.js and npm installed on your system
- Visual Studio Code

### Installation
- Clone the repository to your local machine

        git clone https://gecgithub01.walmart.com/IBG/ibg-test-scripts-bdd.git

- Install the required dependencies

        npm install
        npx playwright install  

### Local Test Execution
- Check the configuration in the config files available in the [Config Folder](configs)
- Open the corresponding workstreams Config file
- Choose a project from the projects available in that config file
- Open [package.json](package.json) and check the scripts section
- Open [.env-cmdrc.json] and update the custum tag with the tag u want to run
- Copy the script that matches with the required project 
- For Mac Run the below command after replacing the script name

          ENV=qa TEST=tag_name npm run <script-name-from-package-json>
          Example- ENV=qa TEST=custom_tag npm run tests:ufm-tests


- For Windows we need to provide the absolute path for playwright and env-cmd Hence Run the below command after replacing the config file and project

           ./node_modules/.bin/env-cmd --environments qa ./node_modules/.bin/env-cmd --environments tag ./node_modules/.bin/playwright test --config=configs/ufm.config.ts --project=ufm-be

           Example-  ./node_modules/.bin/env-cmd --environments develop ./node_modules/.bin/env-cmd --environments Get_Historicals ./node_modules/.bin/playwright test --config=configs/ufm.config.ts --project=ufm-be

### Folder Structure

    .
    ├── ...
    ├── configs                 # config files 
    ├── tests
    │   ├── ufm-be              # workstream folders
    │   │   ├── fixtures        # playwright fixture files
    │   │   ├── globalsetup     # Prerequisite setup
    │   │   ├── testcases       
    │   │   ├── testdata
    │   │   └── ...             # etc.
    │   └── ... 
    ├── .env-cmdrc.json         # Environmental Variables  
    ├── .looper.yml             # looper build steps
    ├── .concord.yml            # CI configuration
    ├── package.json            # dependencies and scripts to run                
    └── ...


### Self signed Certificate issue

If you are facing any self signed certificate error during API calls then add the trust certificate by refering the below link
 [Trust the Walmart Root CA](https://dx.walmart.com/documents/product/DX%20Console/Development-Machine-Setup-08hu0cw1l9#1-trust-the-walmart-root-ca) 

        export NODE_EXTRA_CA_CERTS=<path_to_certificate>


