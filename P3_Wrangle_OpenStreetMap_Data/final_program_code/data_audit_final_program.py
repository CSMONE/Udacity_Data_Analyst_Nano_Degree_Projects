

import os
os.chdir('/Users/liz/Documents/p3')
OSM_FILE = "beijing_china.osm"

import xml.etree.cElementTree as ET
import pprint
from collections import defaultdict
import re
import cerberus
import schema
import csv
import collections
import codecs


#=======compute unique element type numbers.======= # 

def count_tags(filename):
    """  
    Args: filename that want to be auditted
    Returns: a dictionary contains different tags with their amount
    """
    tags={}
    tree = ET.parse(filename)
    root=tree.getroot()
    for el in root.iter():
        if el.tag  in tags.keys():
            tags[el.tag]+=1
        else :
            tags[el.tag]=1
    return tags
        
tags = count_tags(OSM_FILE)
pprint.pprint(tags)

# ================================================== #



#=========compute unique contributions.=========== #

def get_user_number(filename):
    """
    Args: filename that want to be auditted
    Returns: amount of unique contributors
    """
    users=set();
    for _, element in ET.iterparse(filename):
        uid=element.get('uid')
        if uid != None:
            users.add(uid)      
    return len(users)

user_number = get_user_number(OSM_FILE)
print user_number

# ================================================== #



# ========compute number of four kinds of tag categories=== #
# 1. tags that contain only lowercase letters and are valid.
# 2. tags with a colon in the value.
# 3. tags with problematic characters.
# 4. other tags

lower = re.compile(r'^([a-z]|_)*$')
lower_colon = re.compile(r'^([a-z]|_)*:([a-z]|_)*$')
problemchars = re.compile(r'[=\+/&<>;\'"\?%#$@\,\. \t\r\n]')

def key_type(element, keys):
    """
    Args: 
        element:secondary element in xml file
        keys : an dictionary of 4 kinds tags with its amount
    Returns: the updated arg keys, after processing this element
    """
    if element.tag == "tag":
        value = element.attrib['k']
        if lower.search(value):
            keys["lower"]+=1
        elif lower_colon.search(value):
            keys["lower_colon"]+=1
        elif problemchars.search(value):
            keys["problemchars"]+=1
        else:
            keys["other"]+=1      
    return keys

def process_map(filename):
    """
    Args: filename that want to be auditted
    Returns: a dictionary of 4 kinds tags with its amount
    """
    keys = {"lower": 0, "lower_colon": 0, "problemchars": 0, "other": 0}
    for _, element in ET.iterparse(filename):
        keys = key_type(element, keys)
    return keys

keys = process_map(OSM_FILE)
pprint.pprint(keys)

# ================================================== #



# ========audit attibute: 'addr:postcode'=========== #

# Since the first 2 places of postcode in Beijing is '10' 
# and the code has a length of 6. 
# So we can find incorrect codes in the dataset as follows:

def audit_postcode(filename):
    """
    Args: filename that want to be auditted
    Returns: a set of different postcode
    """
    post_code = set();
    for _, element in ET.iterparse(filename):
            if element.tag == "node" or element.tag == "way":
                for tag in element.iter("tag"):
                    if  tag.get('k') == 'addr:postcode' and (len(tag.get('v')) != 6 or tag.get('v')[:2] !='10'):
                    	post_code.add(tag.get('v'))
    return post_code

postcode_set = audit_postcode(OSM_FILE)
pprint.pprint(postcode_set)

# There are only 6 incorrect codes: 010-62332281, 10043, 10043, 10080, 3208. 
# Depend on the characteristic of incorrect codes, I make following strategies to rectify the wrong code.
# 1. For those code shorter than 6 , if the first 2 place is not '10' and the length is 4 , 
#    then I will add '10' in front of the code. If the first 2 place is '10', 
#    I will add '0' at the end of the code till the length reach 6. 
#    Else I will remove the code.
# 2. For those code longer than 6 with '-' in the string, it's obviously a phone number, I will remove it.
# 3. For code '110101', it represent another city in China, so I will remove it.

def update_postcode(code):  
    """
    Args: a postcode to be processed
    Returns: a processed postcode
    """
    if len(code) < 6 :
        if len(code) == 4 and code[:2] != '10':
            return '10' + code
        elif code[:2] == '10':
            return  (code + '0000')[:6]
        else :
            return ''
    elif len(code) ==6 :
        if code[:2] != '10':
            return ''
    elif '-' in code :
        return ''
    else:
        return code

updated_postcode_list =[];
postcode_list = list(postcode_set)
for code in postcode_list:
    updated_postcode_list.append(update_postcode(code))

for i in range(len(postcode_list)):
    print postcode_list[i], '=>', updated_postcode_list[i]

# ================================================== #



# =======audit attribute: 'addr:city'============= #

def collect_city(filename):
    """
    Args: filename that want to be auditted
    Returns: a set of different city names
    """
    addr_city = set();
    for _, element in ET.iterparse(filename):
        if element.tag == "node" or element.tag == "way":
            for tag in element.iter("tag"):
                if  tag.get('k') == 'addr:city' :
                    addr_city.add(tag.get('v'))
    return addr_city

city_set = collect_city(OSM_FILE)
for city in city_set:    
     print city

# Strings in Chinese are correct. And most English string are correct, 
# except string 'yes'. Since it's in Beijing, I will change string 'yes' to 'Beijing'

def update_city(city):  
    """
    Args: a city name to be processed
    Returns: a processed city name
    """
    if city == 'yes' :
        return 'Beijing'
    else:
        return city
            
updated_city_list =[];
city_list = list(city_set)
for city in city_list:
    updated_city_list.append(update_city(city))

for i in range(len(city_list)):
    print city_list[i], '=>', updated_city_list[i]

# ================================================== #



# =======audit attribute: 'addr:street'============= #
# First, let's see different street names.

def collect_street(filename):
    """
    Args: filename that want to be auditted
    Returns: a set of different street names
    """
    street_set = set();
    for _, element in ET.iterparse(filename):
        if element.tag == "node" or element.tag == "way":
            for tag in element.iter("tag"):
                if  tag.get('k') == 'addr:street' :
                    street_set.add(tag.get('v'))
    return street_set

street_set = collect_street(OSM_FILE)
for street in sorted(street_set):
    print street

# Strings in Chinese are correct. 
# But some translated street names are incorrect. 
# Considering the complicated diversification of Chinese language, 
# it's difficult to arrange all the street types. 
# So I will recify incorrect names like this: 
# First, collecting incorrect English names. 
# Then based on it, creating a mapping of correct names. 
# Finally, updating the incorrect street names with a correct ones.


street_type_re = re.compile(r'\b\S+\.?$', re.IGNORECASE)
import collections
incorrect_street = ['Jie','Lu','St','road','Rd','Str','Rd.','St.','jie','lu','ave.','street','Ave']

mapping = { 'Ave':'Avenue',
            'ave.':'Avenue',
            'Rd':'Road',
            'Rd.':'Road',
            'Lu':'Road',
            'road':'Road',
            'St': 'Street',
            'St.': 'Street',
            'Str':'Street',
            'street':'Street',
            'Jie':'Street',
            'jie':'Street' }


def audit_street_type(street_types, street_name):
    """
    Args: 
        street_types: a set of different street types
        street_name: a new street name 
    Returns: update the arg street_types after processing the new street name
    """
    m = street_type_re.search(street_name)
    if m:
        street_type = m.group()
        if street_type in incorrect_street:
            street_types[street_type].add(street_name)

def audit(filename):
    """
    Args: filename that want to be auditted
    Returns: a set of street names with different types
    """
    street_types = collections.defaultdict(set)
    for _, elem in ET.iterparse(filename):
        if elem.tag == "node" or elem.tag == "way":
            for tag in elem.iter("tag"):
                if tag.attrib['k'] == "addr:street":
                    audit_street_type(street_types, tag.attrib['v'])
    return street_types

def update_street_name(name, mapping = mapping , regex = street_type_re):
    """
    Args: 
        name:  origin street name
        mapping:  street name mapping rule of unexpected street types to appropriate ones
        regex:  regular expressions for extracting the type of name
    Returns: an appropriate street name from origin name
    """
    m = regex.search(name)
    if m:
        st_type = m.group()
        if st_type in mapping:
            name = re.sub(regex, mapping[st_type], name)
    return name

incorrect_street_dict = audit(OSM_FILE);
for street_type, ways in incorrect_street_dict.iteritems():
    for name in ways:
        better_name = update_street_name(name, mapping, street_type_re)
        print name, "=>", better_name

# ================================================== #



# ======= audit attribute: 'addr:street:en'========= #

def collect_street_en(filename):
    """
    Args: filename that want to be auditted
    Returns: a set of different English street names
    """
    street_en_set = set();
    for _, element in ET.iterparse(filename):
        if element.tag == "node" or element.tag == "way":
            for tag in element.iter("tag"):
                if  tag.get('k') == 'addr:street:en' :
                    street_en_set.add(tag.get('v'))
    return street_en_set

street_en_set = collect_street_en(OSM_FILE)
for street_en in street_en_set:
    print street_en 

# it's all correct
# ================================================== #



# ======= audit attribute: 'addr:country'========= # 

def collect_country(filename):
    """
    Args: filename that want to be auditted
    Returns: a set of different country names
    """
    country_set = set();
    for _, element in ET.iterparse(filename):
         if element.tag == "node" or element.tag == "way":
            for tag in element.iter("tag"):
                if  tag.get('k') == 'addr:country' :
                    country_set.add(tag.get('v'))
    return country_set

country_set = collect_country(OSM_FILE)
for country in country_set:
    print country

# it's all correct
# ================================================== #
