#制定node镜像版本
FROM node
#作者
MAINTAINER jiongrui
#移动当前目录下面的文件到app目录中
ADD . /app/
#进入到app目录下面，类似cd
WORKDIR /app
#安装依赖
RUN npm install
#对外暴露的端口
EXPOSE 8985
#程序启动脚本
CMD ["npm", "start"]