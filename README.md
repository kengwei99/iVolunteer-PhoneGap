# iVolunteer-PhoneGap
Mobile Application Coursework - PhoneGap

> PS: Currently, this project only work for Phonegap with version 7.1.1

If Phonegap Version is > 7.1.1

Please enter this in command prompt: 

	npm install -g phonegap@7.1.1

1) First we need to create the ivolunteer project

```
 phonegap create "ivolunteer" "com.ivolunteer" "iVolunteer"
```

> Inside the ivolunteer folder, please replace the www folder with the www folder that you have downloaded from here.

2) Add platform for ivolunteer project
```
	cd ivolunteer

phonegap platform add android
```

3) Add SQLite Plugin for ivolunteer project

```
	cordova plugin add cordova-sqlite-storage --save
```

4) Build the ivoluteer project

```
	phonegap build android
```


5) Run Phonegap Project (Either Android phone or android emulator)
```
	phonegap run android
```
