#connect db
#query DB to get the transcript col
#get the trancripts with the correct queries and results

import sqlite3
from dataFormatter import *
import sys

con = sqlite3.connect("back-end/data/project.db") 
c = con.cursor()

query = sys.argv[1]
ChannelName = sys.argv[2]
DataRangeStart = sys.argv[3]
DateRangeEnd = sys.argv[4]
DateRange = DataRangeStart + " to " + DateRangeEnd

sqlQuery = "SELECT Link, VideoName, Transcript FROM Users WHERE ChannelName =" + "'" + ChannelName + "'" + " AND " + "Transcript like"+ "'" + "%" + query + "%' LIMIT 100"

c.execute(sqlQuery)
con.commit()
rows = c.fetchall()
result = []
for row in rows:
    actualData = row[2]
    splitData = actualData.split("; ")
    query = query.lower()
    videoLinkList = []
    myDict = {}
    timestampsList = [] 
    for i in splitData:
        i = i.lower()
        if query in i:
            timestampsList.append(i[1:i.find(',')])
    myDict[row[0]] = timestampsList
    result.append(myDict)

print(result)

c.execute('''INSERT INTO Results(ChannelName, DateRange, Query, Results) VALUES (?,?,?,?)''',(ChannelName, DateRange, query, str(result)))
con.commit()
con.close()


