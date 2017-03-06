#!/usr/bin/python
#sklearn version 0.18
import sys
import pickle
sys.path.append("../tools/")

from feature_format import featureFormat, targetFeatureSplit
from tester import dump_classifier_and_data,test_classifier

#Select what features you'll use
features_list = ['poi', 'bonus', 'deferral_payments', 'deferred_income', 'director_fees', 'exercised_stock_options',
  'expenses', 'from_messages', 'from_poi_to_this_person', 'from_this_person_to_poi', 'loan_advances',
  'long_term_incentive', 'restricted_stock', 'restricted_stock_deferred', 'salary', 'shared_receipt_with_poi',
  'to_messages', 'total_payments', 'total_stock_value'] 

#Load the dictionary containing the dataset
with open("final_project_dataset.pkl", "r") as data_file:
    data_dict = pickle.load(data_file)

#Remove outliers .Outlier Investigation 
import numpy as np
import matplotlib.pyplot as plt

del data_dict['TOTAL']
def ExtractFeature(data_dict, feature):
    value_list = []
    poi_list = []
    for key in data_dict.keys() :
        v = data_dict[key][feature]
        p = data_dict[key]['poi']
        if v == 'NaN':
            v=0
        value_list.append(v)
        if p == 'TRUE':
            p=1
        else :
            p=0
        poi_list.append(p)

    return np.array([value_list,poi_list])

# Create a function to draw histogram, boxplot and scatterplot.
# For observing whether there are outliers.
def feature_observe(data_dict,feature):
    Arr = ExtractFeature(data_dict, feature)

    plt.hist(Arr[0,:])
    plt.show()

    plt.boxplot(Arr[0,:])
    plt.show()

    plt.scatter(x=Arr[0,:],y=Arr[1,:])
    plt.show()

# After observing each features, remove outliers
# Meanwhile, remove features with too many missing values
features_list.remove('director_fees')
features_list.remove('loan_advances')
features_list.remove('restricted_stock_deferred')

for key in data_dict.keys() :
    del data_dict[key]['director_fees']
    del data_dict[key]['loan_advances'] 
    del data_dict[key]['restricted_stock_deferred']  

for key in data_dict.keys() :
    if data_dict[key]['deferral_payments'] > 6000000 and data_dict[key]['deferral_payments'] != 'NaN'  \
    or data_dict[key]['from_messages'] > 6000 and data_dict[key]['from_messages'] != 'NaN'  \
    or data_dict[key]['from_poi_to_this_person'] > 500 and  data_dict[key]['from_poi_to_this_person'] != 'NaN' \
    or data_dict[key]['long_term_incentive'] > 5000000 and data_dict[key]['long_term_incentive'] != 'NaN' \
    or data_dict[key]['total_payments'] > 100000000 and data_dict[key]['total_payments'] != 'NaN' :
        del data_dict[key]

### Create new feature(s) . Properly scale features
### Store to my_dataset for easy export below.
features_list.append('fraction_from_poi_to_this_person')
features_list.append('fraction_from_this_person_to_poi')
for key in data_dict.keys() :
    if data_dict[key]['from_poi_to_this_person'] =="NaN" or data_dict[key]['to_messages']=="NaN":
        data_dict[key]['fraction_from_poi_to_this_person'] = 0.0
    else:
        data_dict[key]['fraction_from_poi_to_this_person'] = \
        1.0*data_dict[key]['from_poi_to_this_person'] /     \
        data_dict[key]['to_messages']
        
    if data_dict[key]['from_this_person_to_poi'] =="NaN" or data_dict[key]['from_messages']=="NaN":
        data_dict[key]['fraction_from_this_person_to_poi'] = 0.0
    else:
        data_dict[key]['fraction_from_this_person_to_poi'] = \
        1.0*data_dict[key]['from_this_person_to_poi'] /     \
        data_dict[key]['from_messages']

# Scale feature by MinMaxScaler
def ExtractFeature(data_dict, feature):
    value_list = []
    for key in data_dict.keys() :
        v = data_dict[key][feature]
        if v == 'NaN':
            v = 0
        value_list.append(v)
    return np.array(value_list)

from sklearn import preprocessing
min_max_scaler = preprocessing.MinMaxScaler()
for feature in features_list[1:] :
    Arr = ExtractFeature(data_dict, feature)
    Scaled_Arr = min_max_scaler.fit_transform(Arr)
    i=0
    for key in data_dict.keys() :
        data_dict[key][feature] = Scaled_Arr[i]
        i += 1

# Featrue selection, use SelectKBest to get scores of every features
FeatureArr = []
for feature in features_list[1:] :
    tmp = []
    for key in data_dict.keys() :
        tmp.append(data_dict[key][feature])
    FeatureArr.append(tmp)
FeatureArr = np.transpose(np.array(FeatureArr))

LabelArr = []
for key in data_dict.keys() :
    LabelArr.append(data_dict[key]['poi'])
LabelArr = np.transpose(np.array(LabelArr))     

from sklearn.feature_selection import SelectKBest, f_classif
selector = SelectKBest(f_classif)
selector.fit(FeatureArr, LabelArr)
features = np.array(features_list[1:])
scores = selector.scores_
FeatureScore = dict(zip(features,scores))
scores_sorted = sorted(scores,reverse=True)

### Try a varity of classifiers and tune the algorithms. Pick an algorithm and features 
from sklearn import naive_bayes, svm, tree, ensemble, neighbors, linear_model, model_selection, metrics
from sklearn.cross_validation import StratifiedShuffleSplit

# Use cross validation to evaluating each model. 
# Return recall, precision, F1 score
def Validation(clf, dataset, feature_list):
    data = featureFormat(dataset, feature_list, sort_keys = True)
    labels, features = targetFeatureSplit(data)
    n_iter = 1000
    cv = StratifiedShuffleSplit(labels, n_iter=n_iter, test_size=0.2)
    f1_list = []
    recall_list = []
    precision_list = []
    for train_idx, test_idx in cv: 
        features_train = []
        features_test = []
        labels_train = []
        labels_test = []
        for ii in train_idx:
            features_train.append( features[ii] )
            labels_train.append( labels[ii] )
        for jj in test_idx:
            features_test.append( features[jj] )
            labels_test.append( labels[jj] )
        
        ### fit the classifier using training set, and test on test set
        clf.fit(features_train, labels_train)
        predictions = clf.predict(features_test)
        predictions, labels_test

        precision_list.append(metrics.precision_score(labels_test, predictions))
        recall_list.append(metrics.recall_score(labels_test, predictions))
        f1_list.append(metrics.f1_score(labels_test, predictions))

    return sum(precision_list)/n_iter, sum(recall_list)/n_iter, sum(f1_list)/n_iter
    
# Set different values of parameters for each classifier 
clfs_dict = {'nb':{'clf':naive_bayes.GaussianNB(),'parameters':{}}, \
             'svm':{'clf':svm.SVC(),    \
                    'parameters':{'kernel':['rbf', 'poly','sigmoid','linear'],   \
                                  'gamma':[0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,1.2,1.5,2], \
                                  'C':[1,5,10,15,20,25,30,35,40,45,50,60,70,80,90]}}, \
             'dt':{'clf':tree.DecisionTreeClassifier(),    \
                   'parameters':{'criterion':['gini','entropy']}},  \
             'knn':{'clf':neighbors.KNeighborsClassifier(),    \
                   'parameters':{'n_neighbors':[3,4,5,6,7,8]}},
             'lr':{'clf':linear_model.LogisticRegression(),  \
                   'parameters':{'penalty' : ['l1','l2'], \
                   'C':[1,5,10,15,20,25,30,35,40,45,50,60,70,80,90]}}}

# Set score function for GridSearchCV
# Since we take precision and recall as main metrics, I use F1 as a scorer.
f1_scorer = metrics.make_scorer(metrics.f1_score)
best_dict = {}
my_dataset = data_dict
for clf_key in clfs_dict.keys():
    best_dict[clf_key] = []
    for k in range(3,16,1):
        boundary = scores_sorted[k]
        newFeatureList = ['poi']
        for Feature_key in FeatureScore.keys():
            if FeatureScore[Feature_key]>boundary:
                newFeatureList.append(Feature_key)
        
        ### Extract features and labels from dataset for local testing
        data = featureFormat(my_dataset, newFeatureList, sort_keys = True)
        labels, features = targetFeatureSplit(data)
        target_clf = clfs_dict[clf_key]['clf']
        parameters = clfs_dict[clf_key]['parameters']
        clf = model_selection.GridSearchCV(target_clf, parameters,scoring=f1_scorer)
        clf.fit(features,labels)
        best_params = clf.best_params_
        tmp_dict = {}
        tmp_dict['k']=k
        tmp_dict['params']= best_params
        target_clf.set_params(**best_params)
        precision, recall, f1 = Validation(target_clf, my_dataset, newFeatureList) 
        tmp_dict['precision'] = precision
        tmp_dict['recall'] = recall
        tmp_dict['f1'] = f1     
        best_dict[clf_key].append(tmp_dict)

import pandas as pd 

# Store the performance of each models in a dataframe
score_df = pd.DataFrame(np.zeros(195).reshape((13,15)), \
    index = list(range(3,16,1)), \
    columns = [['nb']*3+['svm']*3+['dt']*3+['knn']*3+['lr']*3, \
                ['precision', 'recall', 'f1']*5])

for clf_key in best_dict.keys():
    for i in range(len(best_dict[clf_key])):
        for metric in ['precision', 'recall', 'f1']:
            score_df.loc[best_dict[clf_key][i]['k'],(clf_key,metric)] = round(best_dict[clf_key][i][metric],2)

score_df.index.names = ['k']

# After observing the performance of each model,
# I choose Naive Bayes as the final classifier and top 6 features.
final_clf = naive_bayes.GaussianNB()
score_boundary = scores_sorted[6]
final_features_list = ['poi']
for Feature_key in FeatureScore.keys():
    if FeatureScore[Feature_key] > score_boundary:
        final_features_list.append(Feature_key)

### Dump classifier, dataset, and features_list 
dump_classifier_and_data(final_clf, my_dataset, final_features_list)

