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
      "label":"node1",
      "failureRate":0.3,
      "repairRate":0.7
    },
    {
      "label":"node2",
      "failureRate":0.5,
      "repairRate":0.6
    }
    ],
  "links":[{
    "length":10,
    "failureRate":0.5,
    "repairRate":0.6,
    "src":"node1",
    "dest":"node2"
  }
    ]
}
 ```
