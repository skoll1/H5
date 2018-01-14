// 以下代码不能应用于生产环境中的原因。
// 1：缓存取决于每次更新的缓存键：此缓存方法要求您在每一次内容发生修改的时候更新缓存键，否则将不会更新缓存，而提供旧内容。因此，在处理此项目时，请务必在每次发生内容更改的时候更改缓存键
// 2：在每次发生更改时都要重下载所有的内容：有可能仅仅是修改一个字符也是这样，根本没有效率而言。
// 3：浏览器缓存文件缓存可能阻止服务工作线程缓存更新：由于所有的https都需要直接发送到网络，绕过浏览器，不然浏览器可能会发送给自己的的旧缓存数据。
// 4：sw-precache库,可以对过期内容实施精细控制，确保请求直接发送至网络
var CACHE_NAME='my-site-cache-v1';
// 采取缓存优先于网络的策略
var dataCacheName='weatherDate-1';
  var urlsToCache=[
  '/',
  '/styles/main.css',
  '/script/main.js'
  ];
  // 打开缓存
  // 缓存文件缓存可能阻止服务工作线程缓存更新
  // 确认所有需要的资产是否缓存
  // 触发服务器工作线程时，他应该打开cache对象并为其添加app shell所需的资产
self.addEventListener('install',function(event){
      event.waitUntil(
        caches.open(CACHE_NAME)
        // 打开缓存并提供一个缓存名称
          .then(function(cache){
            console.log('open cache');
            return cache.addAll(urlsToCache);
            // 从服务器获取文件，并将响应添加到缓存内。 如果所有的文件都成功缓存，则将安装服务工作线程，如果有任何文件无法下载，则安装步骤将失败。

            // 到目前为止，我们还不能离线运行，我们虽然一缓存了app shell组件，但是任然需要从本地加载他们。
          })
        )
})

// 从缓存中提供app shell
self.addEventListener('fetch',function(event){
  event.respondWidth(
    // cache.macth会由内而外的触发抓取事件的网络请求进行评估，并检查他们是否位于缓存内。它随即使用一缓存的本本做出响应。

    caches.match(event.request)
      .then(function(response){
        if(response){
          return response ||fetch(event.request);
          // 利用以缓存的版本做出响应，或者利用fetch从网络获取一个副本
        }
        return fetch(event.request);
      }))

  // response通过e.respondwidth()返回至网页。

  // 
})
self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetch', e.request.url);
  var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
  if (e.request.url.indexOf(dataUrl) > -1) {
    // 检查网址是否以weather api的地址开头，如果是，我们将使用抓取发出请求。返回请求后。我们的代码打开缓存，克隆响应，将其存储在缓存内，最后将响应返回给原始请求者。

    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        return fetch(e.request).then(function(response){
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});