This is how to add nodes and edges to the graph. I'm using Flow type notation:
```
type Node = {|
  ?group: "nodes",
  data: {
    id: string | number,
    // Other values as necessary. These can be accessed with Node.data()
  },
  position: {| // Only required if the nodes are added after initialization
    x: number, // "model position" which is not scaled by zoom
    y: number, // "model position" which is not scaled by zoom
  |},
  renderedPosition: {| // Can use in place of position
    x: number, // pixels
    y: number, // pixels
  |},
  ?selected: boolean,
  ?classes: string, // space separated class list
|};
type Edge = {|
  ?group: "edges",
  data: {
    id: string | number,
    source: string | number, // Node id
    target: string | number, // Node id
    // Other values as necessary. These can be accessed with Node.data()
  },
|},
type Element = Node | Edge;
type Elements = Array<Element>;
```

Here is a sample of some JSON which produces a simple graph.
```json
{
  "elements": [
    {
      "group": "nodes",
      "data" : {
         "id": "n1"
       },
       "position": {
         "x": 0,
         "y": 0
       }
    },
    {
      "group": "nodes",
      "data" : {
         "id": "n3"
       },
       "position": {
         "x": 100,
         "y": 0
       }
    },
    {
      "group": "nodes",
      "data" : {
         "id": "n4"
       },
       "position": {
         "x": 0,
         "y": 100
       }
    },
    {
      "group": "nodes",
      "data" : {
         "id": "n5"
       },
       "position": {
         "x": 100,
         "y": 100
       }
    },
    {
      "group": "nodes",
      "data" : {
         "id": "n2"
       },
       "position": {
         "x": 50,
         "y": 50
       }
    },


    {
      "group": "edges",
      "data": {
        "id": "e1",
        "source": "n1",
        "target": "n2"
      }
    },
    {
      "group": "edges",
      "data": {
        "id": "e2",
        "source": "n1",
        "target": "n3"
      }
    },
    {
      "group": "edges",
      "data": {
        "id": "e3",
        "source": "n5",
        "target": "n2"
      }
    },
    {
      "group": "edges",
      "data": {
        "id": "e4",
        "source": "n4",
        "target": "n5"
      }
    },
    {
      "group": "edges",
      "data": {
        "id": "e5",
        "source": "n3",
        "target": "n5"
      }
    },
    {
      "group": "edges",
      "data": {
        "id": "e6",
        "source": "n2",
        "target": "n4"
      }
    }
  ]
}
```
