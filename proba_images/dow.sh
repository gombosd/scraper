for VAR in $(sed 's/\"/ /g' kk.txt)
do 
	if  [ "${VAR}" != "," ] && [ "${VAR}" != "]" ] && [ "${VAR}" != "[" ]
	then
		wget $VAR
	fi
done
