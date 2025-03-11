# Parasol Insurance Workshop

## 日本語版のデプロイ方法
- RHDPでオリジナルの[Parasol Insurance AI Workshop](https://catalog.demo.redhat.com/catalog?item=babylon-catalog-prod/sandboxes-gpte.ocp-wksp-ai-parasol-insurance.prod&utm_source=webapp&utm_medium=share-link)を払い出す
- ocコマンドが実行可能なLinux環境を準備し、OpenShiftクラスタにAdminでログイン
- `workshop_deploy.sh`を実行
- 以下のような実行ログが表示され、全体でおよそ30分程度かかります

```
$ ssh lab-user@bastion.p5z9r.sandbox820.opentlc.com
The authenticity of host 'bastion.p5z9r.sandbox820.opentlc.com (3.141.230.61)' can't be established.
ED25519 key fingerprint is SHA256:ff91/IHddwNkHyTrlzH+d6a449VoicDCQUeGW0A1nfI.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'bastion.p5z9r.sandbox820.opentlc.com' (ED25519) to the list of known hosts.
lab-user@bastion.p5z9r.sandbox820.opentlc.com's password: 

[lab-user@bastion ~]$ git clone https://github.com/team-ohc-jp-place/parasol-insurance.git
Cloning into 'parasol-insurance'...
remote: Enumerating objects: 3615, done.
remote: Counting objects: 100% (865/865), done.
remote: Compressing objects: 100% (301/301), done.
remote: Total 3615 (delta 659), reused 586 (delta 564), pack-reused 2750 (from 2)
Receiving objects: 100% (3615/3615), 23.57 MiB | 25.41 MiB/s, done.
Resolving deltas: 100% (1840/1840), done.

[lab-user@bastion ~]$ cd parasol-insurance/
[lab-user@bastion parasol-insurance]$ git checkout translation-jp
branch 'translation-jp' set up to track 'origin/translation-jp'.
Switched to a new branch 'translation-jp'

[lab-user@bastion parasol-insurance]$ ./workshop_deploy.sh 
Scaling up a blank GPU machineset... machineset.machine.openshift.io/cluster-p5z9r-lf29t-worker-gpu-us-east-2b scaled
machineset.machine.openshift.io/cluster-p5z9r-lf29t-worker-gpu-us-east-2b condition met
done.
Replacing the applicationset... applicationset.argoproj.io/bootstrap configured
done.
Deleting the applications to be patched forcibly... Warning: Immediate deletion does not wait for confirmation that the running resource has been terminated. The resource may continue to run on the cluster indefinitely.
application.argoproj.io "ic-shared-llm-app" force deleted
Warning: Immediate deletion does not wait for confirmation that the running resource has been terminated. The resource may continue to run on the cluster indefinitely.
application.argoproj.io "ic-shared-database-app" force deleted
Warning: Immediate deletion does not wait for confirmation that the running resource has been terminated. The resource may continue to run on the cluster indefinitely.
application.argoproj.io "ic-shared-app" force deleted
done.
Wait for replaced applications being ready... done.
Replacing all git repositories in all workbenches... Cloning into 'parasol-insurance'...
Switched to a new branch 'translation-jp'
branch 'translation-jp' set up to track 'origin/translation-jp'.
appproject.argoproj.io/project-user1 patched
deployment.apps/showroom scaled
deployment.apps/showroom updated
deployment.apps/showroom updated
deployment.apps/showroom scaled
Cloning into 'parasol-insurance'...
branch 'translation-jp' set up to track 'origin/translation-jp'.
Switched to a new branch 'translation-jp'
appproject.argoproj.io/project-user2 patched
deployment.apps/showroom scaled
deployment.apps/showroom updated
deployment.apps/showroom updated
deployment.apps/showroom scaled
Cloning into 'parasol-insurance'...
branch 'translation-jp' set up to track 'origin/translation-jp'.
Switched to a new branch 'translation-jp'
appproject.argoproj.io/project-user3 patched
deployment.apps/showroom scaled
deployment.apps/showroom updated
deployment.apps/showroom updated
deployment.apps/showroom scaled
done.
```

## Introduction

This repository contains the code, instructions, resources and materials associated with the Lab called **Parasol Insurance Workshop**.

To consult the static version of the instructions, please use [this URL](https://rh-aiservices-bu.github.io/parasol-insurance/)

If you want to participate in the creation and update of this content, please consult the sections below.

<details>
  <summary>Workshop development information</summary>

## General Development Information

### Working with this repo

- `main-...` branches are the one used for production. That's where the Prod and Test catalog items from [demo.redhat.com](https://demo.redhat.com) point to (instructions, materials used,...). There can be multiple ones, as different versions of the workshop can coexist in the demo catalog. Each version is tied to a version of OpenShift AI.
- `dev-...` branches are for development. That's where the Dev catalog items points to. Each version is tied to a version of OpenShift AI, and matches the production branch (`main-...`).
- Branches are made from their respective `dev` (hot fixes could be made from `main` if really needed).
- When ready, PRs should be made to `dev`. Once all features, bug fixes,... are checked in and tested for a new release, another PR will be made from `dev` to `main`.
- Branches must be prefixed with `/feature` (example `feature/new-pipeline-instructions`), `bugfix`, or other meaningful info.
- Add your name/handle in the branch name if needed to avoid confusion.
- If your development relates to an Issue or a Feature Request, add its reference in the branch name.
- Try to stash your changes before submitting a PR.

## How to update the **Instructions**

Useful link: [https://redhat-scholars.github.io/build-course/rhs-build-course/develop.html](https://redhat-scholars.github.io/build-course/rhs-build-course/develop.html)

### Requirements

- Podman or Docker

### Development

- Add/Modify/Delete content in [content/modules/ROOT](content/modules/ROOT).
- Navigation is handled in `nav.adoc`.
- Content pages are in the `pages` folder.
- To build the site, from the root of the repo, run `./content/utilities/lab-build`.
- To serve the site for previewing, from the root of the repo, run `./content/utilities/lab-serve`.
- The site will be visible at [http://localhost:8443/](http://localhost:8443/)
- When finished, you can stop serving the site by running from the root of the repo `./content/utilities/lab-stop`.

## How to update the **Application**

### Requirements

- Python 3.11
- Nodejs > 18
- An existing instance of an LLM served through an OpenAI compatible API at `INFERENCE_SERVER_URL`. This application is based on Granite-7b-Instruct Prompt format. You will need to modify this format if you are using a different model.

### Installation

Run `npm install` from the main folder.

If you want to install packages manually:

- In the `frontend` folder, install the node modules with `npm install`.
- In the `backend` folder, create a venv and install packages with the provided Pipfile/Pipfile.lock files.
- In the `backend` folder, create the file `.env` base on the example `.env.example` and enter the configuration for the Inference server.

### Development

From the main folder, launch `npm run dev` or `./start-dev.sh`. This will launch both backend and frontend.

- Frontend is accessible at `http://localhost:9000`
- Backend is accessible at `http://localhost:5000`, with Swagger API doc at `http://localhost:5000/docs`

```bash
#!/bin/bash

# Script to restart all showroom pods - You must be logged in as a cluster admin to run this script

# Get all namespaces
namespaces=$(oc get namespaces -o jsonpath='{.items[*].metadata.name}' \
    | tr ' ' '\n' \
    | grep '^showroom')

# Stop all the pods
for namespace in $namespaces; do
    # Check if the deployment "showroom" exists in the namespace
    if oc -n $namespace get deployment showroom &> /dev/null; then
        # If it exists, restart the rollout
        # oc -n $namespace rollout restart deployment/showroom
        oc -n $namespace scale deploy showroom --replicas=0
    fi
done


# wait for them all to fully stop
# start all the pods
for namespace in $namespaces; do
    # Check if the deployment "showroom" exists in the namespace
    if oc -n $namespace get deployment showroom &> /dev/null; then
        # If it exists, restart the rollout
        # oc -n $namespace rollout restart deployment/showroom
        oc -n $namespace scale deploy showroom --replicas=1
    fi
done


```

## How to graduate code from dev to main

- From `dev`, create a new branch, like `feature/prepare-for-main-merge`.
- Modify the following files to make their relevant content point to `main`:
  - `bootstrap/applicationset/applicationset-bootstrap.yaml`
  - `content/antora.yml`
  - `content/modules/ROOT/pages/05-03-web-app-deploy-application.adoc`
- Make a pull request from this branch to `main`, review and merge

</details>

<details>
  <summary>Demo environment information</summary>

- URL: [https://catalog.demo.redhat.com/](https://catalog.demo.redhat.com/)
- Search for `parasol`

</details>
