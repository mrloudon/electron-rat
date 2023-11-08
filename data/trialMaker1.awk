BEGIN { 
    FS = ","
    OUTFILE = "processed_trials.csv"
    printf("\n%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n", "Trial", "Response Time", "Touches", "IR Breaks", "Success", "Start", "End","Shape","Colour","Position","Size") > OUTFILE
    printf("\n%-10s%-15s%-10s%-15s%-10s%-10s%-10s%-8s%-8s%-10s%-8s\n", "Trial", "Response Time", "Touches", "IR Breaks", "Success", "Start", "End", "Shape", "Colour", "Position", "Size")
    print "---------------------------------------------------------------------------------------------------------------"
    shape = "Unknown"
    color = "Unknown"
    position = "Unknown"
    size = "Unknown"
}

$3~/Stimulus/ {
    shape = $4
    color = $5
    position = $6
    size = $7
}

$3~/Shape/ { shape = $4 }
$3~/Color|Colour/ { color = $4 }
$3~/Position|Postion/ { position = $4 }
$3~/Size/ { size = $4 }



$3~/Show/, $3~/End/ { 
    if(($3 == "Show")){
        success = "False"
        responseTime = "None"
        startTime = $2
        touches = 0
        irBreaks = 0
        trials++
        startEvent = $1
    }
    if($3 == "Touch" && $6 == "Success") {
        responseTime = $2 - startTime
        totalResponseTime += responseTime
        success = "True"
        score++
    }
    if($3 == "Touch") { 
        touches++
        totalTouches++
    }
    if($3 == "IR Break") { 
        irBreaks++
        totalIRBreaks++
    }
    if($3 == "End") {
        endEvent = $1
        if(responseTime == "None") { 
            printf("%d,%s,%d,%d,%s,%s,%s,%s,%s,%s,%s\n", trials, responseTime, touches, irBreaks, success, startEvent, endEvent, shape, color, position, size) > OUTFILE
            printf("%-10d%-15s%-10d%-15d%-10s%-10s%-10s%-8s%-8s%-10s%-8s\n", trials, responseTime, touches, irBreaks, success, startEvent, endEvent, shape, color, position, size)
        }
        else {
            printf("%d,%f,%d,%d,%s,%s,%s,%s,%s,%s,%s\n", trials, responseTime, touches, irBreaks, success, startEvent, endEvent, shape, color, position, size) > OUTFILE
            printf("%-10d%-15.1f%-10d%-15d%-10s%-10s%-10s%-8s%-8s%-10s%-8s\n", trials, responseTime, touches, irBreaks, success, startEvent, endEvent, shape, color, position, size)
        }
    }
}

END {
        meanRT = score > 0 ?  totalResponseTime / score : 0.0
        printf("\nN trials: %-4d\tN success: %-4d\tMean response time: %3.1f\t\nN IR breaks: %-4d\tN touches: %-4d\n\n", \
            trials, score, meanRT, totalIRBreaks, totalTouches)
}