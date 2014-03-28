TIG_website
===========

Hi guys!  We've stripped the railsy stuff off for you.  Sorry it took so long, but Barbara and I were hit simultaniously with with both interviews and surprisingly debilitating colds.  I type this to you through a drug induced haze, over a pile of kleenexes, and Barbara is sniffling away next to me.

A few notes.  First, to make it run, even locally, you'll need to use a web-server.  We used a simple node.js server not included in this repo.

Second, below I've included the SQL queries we used to get the information we needed, and the algorithm we used to generate the matrices.  We didn't have a chance to make the json consise and human readable yet, but I'll try to get to that in a week or two.


SQL for friendships:

'SELECT u.userid as MemberID, u.username as MemberName, r.regionid as MemberRegionID, r.regionname as MemberRegionName, f.userid as FriendID, f.username as FriendName, rr.regionid as FriendRegionID, rr.regionname as FriendRegionName FROM users u INNER JOIN updatesfr uf ON uf.memberid = u.userid INNER JOIN users f ON f.userid = uf.friendid INNER JOIN countries c ON c.countryid = u.countryid INNER JOIN countriesregions cr ON cr.countryid = c.countryid INNER JOIN regions r ON r.regionid = cr.regionid INNER JOIN countries cc ON cc.countryid = f.countryid INNER JOIN countriesregions ccr ON ccr.countryid = cc.countryid INNER JOIN regions rr ON rr.regionid = ccr.regionid ORDER BY r.regionid, rr.regionid'

SQL for inspirations:

'SELECT u.userid as MemberID, u.username as MemberName, r.regionid as MemberRegionID, r.regionname as MemberRegionName, f.userid as InspiredMemberID, f.username as InspiredMemberName, rr.regionid as InspiredMemberRegionID, rr.regionname as InspiredMemberRegionName FROM users u INNER JOIN userinspired uf ON uf.memberid = u.userid INNER JOIN users f ON f.userid = uf.inspiredmemberid INNER JOIN countries c ON c.countryid = u.countryid INNER JOIN countriesregions cr ON cr.countryid = c.countryid INNER JOIN regions r ON r.regionid = cr.regionid INNER JOIN countries cc ON cc.countryid = f.countryid INNER JOIN countriesregions ccr ON ccr.countryid = cc.countryid INNER JOIN regions rr ON rr.regionid = ccr.regionid ORDER BY r.regionid, rr.regionid'


matrix = []
list = [1,2,3,4,5,6,7,9,11] #these are the various region ids
list.each do |r1|
  inner_matrix = []
  list.each do |r2|
    inner_matrix <<  f.select{|inspiration| inspiration.MemberRegionID == r1 && inspiration.InspiredMemberRegionID == r2}.count  #we're holding the output of the SQL query in a variable called f. This iterates through f and grabs all appropriate entries, and counts them, then pushes them onto the inner matrix.
  end
  matrix << inner_matrix
  print inner_matrix
  puts ""
end
File.open('json/inspiration_matrix.json', 'w+') {|f| f.write(matrix) }