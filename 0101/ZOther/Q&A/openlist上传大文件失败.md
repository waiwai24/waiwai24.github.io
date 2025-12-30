日志返回413表示上传文件超过服务器允许的最大 body size，原因在于使用了openresty，其只允许 1 MB 的 body，任何 WebDAV PUT 文件上传超过 1MB 都会被拒绝

修改配置文件：在 server 或 location 中加入：

```
client_max_body_size 10G;
client_body_buffer_size 512k;

# WebDAV 需要关闭缓冲，否则 PUT 大文件会失败
proxy_request_buffering off;
proxy_buffering off;
```