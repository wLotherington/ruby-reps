return_value = (
s = "Executable flashcards are great!"
# Enter code here
s.split
 .map { |w| w.include?('!') ? w.upcase : w }
 .join(' ')
)
p return_value
