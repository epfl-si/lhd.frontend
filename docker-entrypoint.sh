#!/bin/bash

INJECT_JSON_FILE=/12factor.json
HTML_FILE=public/index.html

set -e -x

main() {
    source_dir=public
    serve_dir=/tmp/serve
    cp -a "$source_dir" "$serve_dir"
    cp  dist/* $serve_dir/
    if [ -f "$INJECT_JSON_FILE" ]; then
        inject_json_file "$INJECT_JSON_FILE" "$HTML_FILE" < public/index.html > $serve_dir/index.html
    fi

    exec serve -s $serve_dir -l 3000
}

inject_json_file () {
    local json_file="$1" target_html_file="$2"

    sed 's/></>\n</'g < "$target_html_file" | while read line; do
        case "$line" in
            "<"script*)
                echo "<script>window._12factor = "
                cat "$json_file"
                echo ";</script>"
                ;;
        esac
        echo "$line"
    done
}

main
