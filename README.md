# Playing with rxjs and xml-stream



Just a piece of code to experiment how an pretty old `xml-stream` lib can be used with `rxjs`. This code will read from test.xml file all CD's and store it to songs.csv file.

Main reasons to implement this:

1. Test how we can adapt `xml-stream` to be used with `rxjs`
2. Test how we can run async tasks while xml reading/parsing
3. Test how can `rxjs` buffers be utilized to run bunch of updates in 'parallel'

