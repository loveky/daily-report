export default function(snapshot) {
    const firebaseData = snapshot.val();
    let key, value;
    const result = [];

    if (!firebaseData) {
        return [];
    }

    for (key of Object.keys(firebaseData)) {
        try {
            firebaseData[key]['__id'] = key;
        } catch (e) {

        }

        result.push(firebaseData[key]);
    }

    return result;
}