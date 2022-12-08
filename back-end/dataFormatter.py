import json


def dataFormatter(dataToSend):
    temp = dataToSend
    mydict = {}
    while temp != '\0':
        timestamp = temp[0:temp.find("\r\n")]
        temp = temp[temp.find("\r\n")+2:]
        idx = temp.find("\r\n")
        if(idx == -1):
            idx = len(temp)
            transcript = temp[0:idx]
            temp = '\0'
        else:
            transcript = temp[0:idx]
            temp = temp[temp.find("\r\n")+2:]
        mydict[timestamp] = transcript
    json_object = json.dumps(mydict, indent = 4) 
    return(json_object)
    



