Docstrape
=========

JSDOC-Toolkit template based on bootstrap, and it realy looks slik!
You can generate a customised documentation website AND a static documentation with a uniform look-and-feel.

#Requirements
[JSDOC-Toolkit](http://code.google.com/p/jsdoc-toolkit/) and some JSDOCs formatted code.

#Rationale
* This template was developed to integrate the JSDOCS into the revised website of the [APE Project](https://github.com/APE-Project/)
To document API's is one thing. To keep them accurate you need to lower the effords for the developers: That means simple and available
* One of the nice features in the APE_Server is the spidermonkey. c modules. JSDoc-Toolkit handles this with the @name tag.
* I never tested it with JSDOC-toolkit 3. I like to stay independed. I read node.js somewhere and didn't bother to read further.
* It should be able to generate documentation for both 'offline' and 'online' documentation, so that the look-and-feel of a website can be reused.

#What is with the name?
jsdoc bootstrap ape. Get it?

#Example
Probably as one of the few people around I like to use Makefiles. See the example direcory
It is very easy to include seperate headers/footer by giving a prefix parameter (e.g. --define="prefix:online" loads uses online_footer.tmpl and online_header.tmpl snippets)

#License
The Docstrape template is, like JSDOC Toolkit itself, published under the X11/MIT License.
Docstrape is Copyright (c) 2013 Peter Reijnders (peter.reijnders@verpeteren.nl)


