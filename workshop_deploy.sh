#!/bin/bash

# Scale up a blank GPU machineset
echo -n "Scaling up a blank GPU machineset... "
machineset_gpu=$(oc get machineset -n openshift-machine-api | grep gpu | grep "  *0  *0  *" | awk '{print $1}' | head -n 1)
oc scale machineset/${machineset_gpu} --replicas=1 -n openshift-machine-api
oc wait --for jsonpath='{.status.availableReplicas}'=1 --timeout 30m machineset/${machineset_gpu} -n openshift-machine-api
echo "done."

# Replace the applicationset
echo -n "Replacing the applicationset... "
oc apply -f bootstrap/applicationset/applicationset-bootstrap.yaml
echo "done."

# Delete the applications to be patched forcibly
echo -n "Deleting the applications to be patched forcibly... "
oc delete application.argoproj.io/ic-shared-llm-app -n openshift-gitops --force
oc delete application.argoproj.io/ic-shared-database-app -n openshift-gitops --force
oc delete application.argoproj.io/ic-shared-app -n openshift-gitops --force
echo "done."

# Wait for replaced applications being ready
echo -n "Wait for replaced applications being ready... "
TARGET_STATUS="ic-rhoai-configuration Synced Healthy ic-rhoai-installation Synced Healthy ic-rhoai-operator Synced Healthy ic-shared-app Synced Healthy ic-shared-database-app Synced Healthy ic-shared-img-det Synced Healthy ic-shared-llm-app Synced Healthy ic-shared-milvus Synced Healthy ic-shared-minio-app Synced Healthy ic-user-projects Synced Healthy"
while true; do
  status="$(echo $(oc get application.argoproj.io --no-headers -n openshift-gitops 2>/dev/null))"
  if [ "${status}" == "${TARGET_STATUS}" ]; then
    break
  fi
  sleep 10
done
echo "done."

# Replace all git repositories and showroom contents in all workbenches
echo -n "Replacing all git repositories in all workbenches... "
oc get project | grep -E "^user[0-9][0-9]* " | awk '{print $1}' | while read project; do
  oc exec pods/my-workbench-0 -c my-workbench -n {project} -- sh -c "rm -rf parasol-insurance; git clone https://github.com/team-ohc-jp-place/parasol-insurance; cd parasol-insurance; git checkout -b translation-jp origin/translation-jp"
  oc scale --replicas=0 deployment/showroom -n ${project}
  oc set env deployment/showroom GIT_REPO_URL="https://github.com/team-ohc-jp-place/parasol-insurance" -n ${project}
  oc set env deployment/showroom GIT_REPO_REF="translation-jp" -n ${project}
  oc scale --replicas=1 deployment/showroom -n ${project}
done
echo "done."
