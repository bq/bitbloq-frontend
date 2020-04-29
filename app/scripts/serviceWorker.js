'use strict';

var BORNDATE_CACHE_NAME = 'borndate-0.0.20';

self.addEventListener('fetch', function(event) {
    if (/borndate\/*/.test(event.request.url)) {
        event.respondWith(
            caches.open(BORNDATE_CACHE_NAME).then(function(cache) {
                return cache.match(event.request).then(function(cacheResponse) {
                    return (
                        cacheResponse ||
                        fetch(event.request).then(function(response) {
                            cache.put(event.request, response.clone());
                            return response;
                        })
                    );
                });
            })
        );
    }
});
