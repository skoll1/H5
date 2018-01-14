var pool=[];
onconnect=function(e){
    
    var port=e.ports[0];
    console.log(port)
    port.onmessage=function(e){
        // for(var i=0;i<pool.length;i++){
        //     pool[i].postMessage(e.data);
        // }
        console.log(e.data)
        port.postMessage(e.data)
    }

    port.start()
}