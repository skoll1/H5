this.addEventListener('install',function(event){
    event.waitUntil(
        caches.open('my-test-cache-v1').then(function(cache){
            // 创建一个新的缓存，做到这一步，你就可以将站点的资源进行缓存了，下一步要做的是告诉service worker让他用这些缓存内容来做点什么。有了fetch事件，这个是很容易做到的。
            return cache.addAll([
                '/',
                '/index.html',
                '/main.css',
                '/main.js',
                '/image.jpg',
            ])
            // 任何被service worker控制的资源被请求到时，都会触发fetch事件。这些资源主要有以下几方面

            // 1：scope内的html文档，以及这些文档内引用的其他资源（甚至index.html发起了一个跨域请求来嵌入一个图片，这个也会通过Service Worker)
        })
    )
})
// 优点:二次访问即可离线没缺点是需要缓存的url在编译的时候插入到脚本中，增加代码量和降低可维护性。


// 检测fetch

this.addEventListener('fetch',function(event){
    event.responseWhith(
        caches.match(event.request).then(function(response){
            if(response){
                return response
            }
            // 如果service worker有自己的返回，那么就直接返回，减少一次http请求

            // 如果没有的话，那就直接请求远程的服务

            let request =event.request.clone();
            return fetch(request).then((httpres)=>{
                // https请求的返回已被抓到，可以进行处置了

                // 请求失败了，直接返回失败的结果就好了
                if(!httpres||httpres.status!==200){
                    return httpres;
                }

                 // 请求成功的，就将请求缓存起来
                 let responseClone=httpres.clone();
                 caches.open('my-test-cache-v1').then((cache)=>{
                     cache.put(event.request,responseClone);
                 });

                 return httpres;
            })

            
        })
    )
})
// 优点，无需更改编译过程，也不会产生额外的流量，缺点是需要多一次的访问才能离线使用

// 你可以在install的时候进行静态资源缓存，也可以通过fetch事件处理回调来代理页面请求从而实现动态资源缓存。

// 由此看来，除了静态的页面和文件之外，如果对ajax数据加以适当的缓存，那么就可以实现真正的离线可用，要达到这一点，可能需要对既有的web app进行重构以分离数据和模板。
