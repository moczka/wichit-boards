#!/bin/bash

# Name of the PDF source files and Output image files
PDF_FILE=billerica_first_floor.pdf
OUTPUT_IMAGE=billerica_first_floor.png

# Path to the input and output folders
OUTPUT_DIR=../../Public/images/birdsEye
INPUT_DIR=../plans

# These are constant values that do not change
# The scale from a 1:1 PDF to WhosWho resolution

DPI_SCALE=251.25
FULL_WIDTH=2772
FULL_HEIGHT=4284

echo "The scale of the plans is $DPI_SCALE, and dimensions width=$FULL_WIDTH and height=$FULL_HEIGHT"
#The Rectangle used by WhosWho within the Full Size Plans
RECT_WIDTH=2141
RECT_HEIGHT=3282

echo "The dimensions of the image used by Whos Who is $RECT_WIDTH wide and $RECT_HEIGHT in height."


#Plans offset inside of WhosWho resolution rect for First Floor
LEFT_OFFSET=8
TOP_OFFSET=25

#Dynamic Values
#Registration Point location within full size render

regY=500
regX=269

# This gives us the offset for the Rect WhosWho uses within the Full Size Render
offsetY=$(($regY - $LEFT_OFFSET))
offsetX=$(($regX - $TOP_OFFSET))

# Now we calculate the offset from the top left corner by substracting.
left_offset=$(($FULL_WIDTH - ($RECT_WIDTH + $offsetX)))
top_offset=$offsetY

GEOMETRY=$RECT_WIDTH'x'$RECT_HEIGHT+$left_offset+$top_offset

convert -density $DPI_SCALE $INPUT_DIR/$PDF_FILE \
-flatten -crop $GEOMETRY -rotate "-90<" \
$OUTPUT_DIR/$OUTPUT_IMAGE


echo 'Finished processing PDF plans'
