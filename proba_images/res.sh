echo "Start"
cd images_thumbnail/
for file in *
  do
    if [ -f "$file" ];then
     convert "$file" -resize 200x200 "$file"
    fi
  done
echo "Done"
