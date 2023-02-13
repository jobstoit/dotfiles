FROM gitpod/workspace-base:latest

ARG GOLANG_DISABLED=false
ARG RUST_DISABLED=false
ARG OPS_DISABLED=false

COPY . /tmp/bootstrap/

RUN sh /tmp/bootstrap/bootstrap.sh && \
	sudo rm -rf /tmp/bootstrap

CMD ["/usr/bin/zsh"]
