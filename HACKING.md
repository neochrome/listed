Releasing:
----------
Pre-flight checklist:
* Verify changes to cache.manifest 

On master:

    git tag vX.X.X
    git checkout gh-pages
    git pull origin gh-pages
    git merge --no-ff master vX.X.X
    git push --all
    git push --tags

