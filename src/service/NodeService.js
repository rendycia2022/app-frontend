export default class NodeService {
    getTreeTableNodes() {
        return fetch('public/demo/data/treetablenodes.json')
            .then((res) => res.json())
            .then((d) => d.root);
    }

    getTreeNodes() {
        return fetch('public/demo/data/treenodes.json')
            .then((res) => res.json())
            .then((d) => d.root);
    }
}
