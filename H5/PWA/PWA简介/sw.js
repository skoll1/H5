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



// 获取通知事件并处理
this.addEventListener('notificationclick',event=>{
    let clickedNotification=event.notification;
    clickedNotification.close()

    // 执行某些异步操作时，等待他完成
    let promiseChain=doSomething();
    event.waitUntil(promiseChain);

    // 处理标签点击
    if(!event.action){
        console.log('没有通知被点击')
        return ;
    }

    swicth (event.action) {
        case 'coffee-action':
            console.log('User \'s coffee');
        break;
        case 'doughut-action':
            console.log('User\'s doughnuts');
    }


    // 处理点击打开页面的情况
    let examplePage="/demos/notification-examples/example-page.html"
    let promiseChain=clients.openWindow(examplePage);
    event.waitUntil(promiseChain);

    // 如果页面已经被打开，那么更好的做法通常不是再次打开，而是激活那个窗口

    // 注意：我们只能记过在自己域的页面。原因是我们只能知道属于自己的域的哪些页面被打开，但是不能知道其余的哪些页面被打开。

    let urlOpen=new URL(examplePage,self.location.origin).href;
    // 将页面从字符串转为URL类型

    // 获取已经打开的所有窗口，这里的窗口只包含开发者自己域下的。

    let promiseChain=clients.matchAll({
        type:'window',
        includeUncontrolled:true
    }).then(windowClients=>{
        let matchingClients=null;

        for(let i =0,max=windowClients.length;i<max;i++){
            let windowClient=windowClients[i];

            if(windowClient.url===urlOpen){
                matchingClient=windowClient;
                break;
            }
        }
        // 逐个匹配寻找，找到了就激活那个窗口，没有找到就打开新窗口。

        return matchingClient?matchingClient.focus():clients.openWindow(urlOpen);
    });
    event.waitUntil(promiseChain);
})

// 通知关闭事件：在用户关闭通知时触发，统计通知时长，评估通知效果等。
this.addEventListener('notificationclose',event=>{
    let dismissedNotification=event.notification;
    let promiseChain=notificationCloseAndlytics();

    event.waitUntil(promiseChain);
})

