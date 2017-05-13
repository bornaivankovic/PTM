# Prerequisites
```
$ virtualenv PTM
$ .\Scripts\activate
$ pip install django
```
# Running the project
```
$ python manage.py runserver
```
# JSON format
 ```JSON
 {
 	"nodes":[
 		{
 			"name":"node1",
 			"lambda":0.3,
 			"mi":0.7
 		},
 		{
 			"name":"node2",
 			"lambda":0.5,
 			"mi":0.6
 		}
 		],
 	"links":[{
 		"length":10,
 		"lambda":0.5,
 		"mi":0.6,
 		"n1":"node1",
 		"n2":"node2"
 	}
 		]
 }
 ```
