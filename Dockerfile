FROM python:2
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
RUN pip install django


EXPOSE 8000

CMD ["python","PTM/manage.py","runserver","0.0.0.0:8000"]
