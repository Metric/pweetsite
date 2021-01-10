'use strict';

class BinarySearch {
    static firstIndex(arr, fn) {
        let l = 0;
        let r = arr.length - 1;
        let m = 0;
        while(l < r) {
            m = Math.floor((l + r) / 2);
            if(fn(arr[m])) {
                l = m + 1;
            }
            else {
                r = m;
            }
        }
        return l;
    }

    static lastIndex(arr, fn) {
        let l = 0;
        let r = arr.length - 1;
        let m = 0;
        while(l < r) {
            m = Math.floor((l + r) / 2);
            if(fn(arr[m])) {
                r = m;
            }
            else {
                l = m + 1;
            }
        }
        return l - 1;
    }
}