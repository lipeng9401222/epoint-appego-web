FROM registry.epoint.com.cn/epoint_base_test/nodejsbuilder:v0.3 AS dist

COPY . /root/workspace
RUN bash -l -c 'source /root/.bashrc && cd /root/workspace && npm i && npm run build'


FROM registry.epoint.com.cn/base/epoint_alpine_nginx:v1.33

COPY --from=dist /root/workspace/dist/epoint-web /usr/local/nginx/html/epoint-web



