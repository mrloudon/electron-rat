BEGIN { 
    FS = ","
    OUTFILE = "trials.csv"
    printf("\n%s,%s,%s,%s,%s,%s,%s\n", "Trial", "Response Time", "Touches", "IR Breaks", "Success", "Start", "End") > OUTFILE
    printf("\n%-10s%-15s%-10s%-15s%-10s%-10s%-10s\n", "Trial", "Response Time", "Touches", "IR Breaks", "Success", "Start", "End")
    print "-----------------------------------------------------------------------------"
}

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
            printf("%d,%s,%d,%d,%s,%s,%s\n", trials, responseTime, touches, irBreaks, success, startEvent, endEvent) > OUTFILE
            printf("%-10d%-15s%-10d%-15d%-10s%-10s%-10s\n", trials, responseTime, touches, irBreaks, success, startEvent, endEvent)
        }
        else {
            printf("%d,%f,%d,%d,%s,%s,%s\n", trials, responseTime, touches, irBreaks, success, startEvent, endEvent) > OUTFILE
            printf("%-10d%-15.1f%-10d%-15d%-10s%-10s%-10s\n", trials, responseTime, touches, irBreaks, success, startEvent, endEvent)
        }
    }
}

END {
        meanRT = score > 0 ?  totalResponseTime / score : 0.0
        printf("\nN trials: %-4d\tN success: %-4d\tMean response time: %3.1f\tN\nN IR breaks: %-4d\tN touches: %-4d\n\n", \
            trials, score, meanRT, totalIRBreaks, totalTouches)
}