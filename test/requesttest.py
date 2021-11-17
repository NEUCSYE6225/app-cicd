from datetime import time
import requests
import time
import sys

def getserverinfo():
    i = 0
    while True:
        r = requests.get("http://prod.yongjishen.me/")
        print("Timer:{}, {}".format(i,r.json()))
        i+=1
        # time.sleep(1)

def postuser():
    i = 0
    while True:
        params = {
        "first_name": "test"+str(i),
        "last_name": "test"+str(i),
        "password":"Test1111",
        "username": "test"+str(i)+"@example.com"
        }
        print (params)
        i+=1
        r = requests.post("http://prod.yongjishen.me/v2/user/",json=params)
        try:
            print("respond:{}".format(r.json()))
        except:
            print("respond:{}".format(r))
        r = requests.get("http://prod.yongjishen.me/")
        print("Timer:{}, {}".format(i,r.json()))


def postImageforuser():
    # register a account 
    params = {
        "first_name": "test1",
        "last_name": "test1",
        "password":"Test1111",
        "username": "test1111@example.com"
        }
    r = requests.post("http://prod.yongjishen.me/v2/user/",json=params)
    print(r)

    # get image in binary
    with open('/Users/yongjishen/Desktop/background.jpg', 'rb') as f:
        data = f.read()

    while True:
        #upload
        imagepost = requests.post("http://prod.yongjishen.me/v2/user/self/pic",
                                    auth=('test1111@example.com','Test1111'),
                                    headers={"Content-Type": "image/jpeg"},
                                    data=data
                                )
        print(imagepost.json())
        #delete
        imagedelete = requests.delete("http://prod.yongjishen.me/v2/user/self/pic", 
                                    auth=('test1111@example.com','Test1111')
                                )
        print(imagedelete)
        print("*"*20)
        # time.sleep(1)


if __name__ == '__main__':
    if int(sys.argv[1]) == 1:
        getserverinfo()
    elif int(sys.argv[1]) == 2:
        postuser()
    elif int(sys.argv[1]) == 3:
        postImageforuser()










# from types import TracebackType


# def solution(triangle):
#     depth = len(triangle)
#     if depth == 1:
#         print(triangle[0][0])
#         return triangle[0][0]
#     dp = [[0]* i for i in range(1,depth+1)]
#     print(dp[-1])
#     dp[0] = triangle[0]
#     print(dp)
#     print(triangle)
#     # for i in range(depth-1,0,-1):
#     #     for j in range(len(triangle)):
#     #         print(triangle[i-1][j])
#     #         # dp[i][j] = triangle[i][j] + min(dp[i-1][j],dp[i-1][j+1])
#     for i in range(depth):
#         for j in range(len(triangle[i])):
#             print(triangle[i][j])
#             dp[i][j] = triangle[i][j] + min(dp[i-1][j-1],dp[i-1][j])

#     print(dp)



# triangle = [[2],[3,4],[6,5,7],[4,1,8,3]]
# # triangle = [[-10]]
# solution(triangle)


# def minimumTotal(triangle):
#     for i in range(len(triangle) - 1, 0, -1):
#         for j in range(i):
#             triangle[i - 1][j] += min(triangle[i][j], triangle[i][j + 1])
#     print(triangle[0][0])
#     return triangle[0][0]
# minimumTotal(triangle)


# a = 100
# b = 100
# print(a == b)