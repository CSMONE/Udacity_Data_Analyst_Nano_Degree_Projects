**1. Summarize for us the goal of this project and how machine learning is useful in trying to accomplish it. As part of your answer, give some background on the dataset and how it can be used to answer the project question. Were there any outliers in the data when you got it, and how did you handle those?**   

In this project, I aim to build an appropriate algorithm to identify Enron Employees who may have committed fraud based on the public Enron financial and email dataset. Here are some summarise of this dataset :

* Total number of data points: There are totally 146 data points, with 1 summation record of finance, which means actually there are 145 persons' records in the dataset.
* Allocation across classes (POI/non-POI): Except the summation record, there are 18 POIs and 127 non-POIs.
* Number of features used: There are 21 features used.
* Are there features with many missing values: Yes, almost every feature has missing values. Some features like *loan_advances*, *restricted_stock_deferred*, *director_fees*, each has more than 120 missing values.   

From the summarise above, we find the skewed classes phenomenon. That is, POIs are very rare in the entire data set. For this situation, precision and recall are more apropriate than accuracy in evaluating the machine learning algorithms. Since there are 21 features and many missing values, we can remove some useless features to improve the performance of models.
      
In order to remove some outliers out of dataset, I plot the boxplot and scatterplot( x: feature value, y: poi label ) for every feature. I remove those points with obvious extreme value, and remove some features with too many missing values( *loan_advances*, *restricted_stock_deferred*, *director_fees* ) .

**2. What features did you end up using in your POI identifier, and what selection process did you use to pick them? Did you have to do any scaling? Why or why not?**   
 
Finally, I use *salary*, *long_term_incentive*, *bonus*, *total_stock_value*, *exercised_stock_options*, *deferred_income* in my POI identifier. When chooseing features, I use following steps:
 
 * First, I choose features that I think might be useful.
 * Then, after outliers removed, I create two new features: *fraction_from_poi_to_this_person* with the value of *from_poi_to_this_person* divided by the value of *to_messages*, and *fraction_from_this_person_to_poi* with the value of *from_this_person_to_poi* divided by the value of *from_messages*. Since in my opinion,  relative value can express the essence of things better than absolute value.
 * Third, since the dataset include finace data and email data, which are not in the similar orders of magnitude, I deploy feature scaling on all features by using MinMaxScaler method.
 * Fourth, I use SelectKBest method to get the scores of features. Scores of features are in file 'feature_scores.txt' of this fold. 
 * Finally, I don't choose final features at once. Instead, I try a range from 3  to 15 features ( according to the scores from high to low ) with different classifiers to build models, and choose features with the best performance.
 
**3. What algorithm did you end up using? What other one(s) did you try? How did model performance differ between algorithms?**    
   
Fianlly, I use Gaussian Naive Bayes classifier. And I also tried other classifiers: SVM, Decision Tree, KNN, Logistic Regression. I summarized the performance (recall, precision, F1) of each classifier with best parameters on different numbers of features ( k ) in file 'classifiers_performance.png' of this fold ( **Note the column names: 'nb' for Naive Bayes, 'svm' for SVM, 'dt' for Decision Tree, 'knn' for KNN, lr for Logistic Regression**).
     
* We can see that recalls of Logistic Regression and KNN are lower than their precisions obviously. And most recalls are smaller than 0.2. According to their bad performance on recall, obviously, we can not use KNN or Logistic Regression.
* SVM performs better than KNN and Logistic Regression as a whole , since most of it's precisions and recalls are not very low, and some are larger than 0.3. But its performance is worse than Decision Tree and Naive Bayes as a whole, by comparing their recalls, precisions, F1 scores under every single k value (feature number).
* Decision Tree and Naive Bayes perform well, their values of three metrics are better than the other three classifiers. Since it has the highest F1 score and recall, and a high precision of 0.43, I choose Naive Bayes with 6 features in the end.
   
**4. What does it mean to tune the parameters of an algorithm, and what can happen if you don’t do this well?  How did you tune the parameters of your particular algorithm?**   
   
We tune the Parameters of an algorithmr when training, in order to improve its performance on test set. Since parameter can influence the performance of the algorithm, if we don’t do this well,  we may get fragile models and overfit the test harness but don't perform well in practice.   
 
 I use GridSearchCV method for tuning parameters of those five classifiers as followed:
 
 * Naive Bayes: Use Gaussian Naive Bayes classifier, and don't tune any parameters.
 * SVM: Tune kernel, C and gamma with different values.
 * Decision Tree: Try two different criterions: gini and entropy.
 * KNN: Try different neighbor numbers.
 * Logistic Regression: Tune penalty and C with different values.
    
I tune the parameters of different classifiers with different feature numbers, and evalute them by recall, precision, F1 score . 
     
**5. What is validation, and what’s a classic mistake you can make if you do it wrong? How did you validate your analysis?**    

Validation is used to make sure the model generalizes with the remaining part of a dataset. A classic mistake may happen when we don't do it well is over-fitting. That means the model may performs well on training set, but bad on test set. In order to avoid such mistake, I use cross-validation technique to validate models. Since the dataset  is small and skews towards non-POI, I use stratification to achieve robustness. And it iterates over 1000 times with the data divided into 4:1 training-to-test ratio.
   
**6. Give at least 2 evaluation metrics and your average performance for each of them. Explain an interpretation of your metrics that says something human­understandable about your algorithm’s performance.**    

I use recall, precision, F1 score to evaluating models. The performance for them on different models and feature numbers is summarized in file 'classifiers_performance.png' of this fold as I mentioned in third question. The best performance belongs to Gaussian Naive Bayes with top 6 scored features, whose average recall is 0.47, precision is 0.43 , and F1 score is 0.43.
   
Precision refer to that within the POIs(positive) the model predicts, how many are actual POIs(true positive). While recall within the actual POIs, how many the model predicts them as POIs(true positive). For instance, a precision score of 0.3 means if this model predicts 10 POIs, then 3 of them are actualy POIs and other 7 are non-POIs. A recall score of 0.3 means if there are 10 actual POIs of all, the  model predicts 3 of these 10 as POIs and other 7 as non-POIs.    
F1 score is the harmonic mesn of recall and precision, which measures the combination property of recall and precision.
   
   
###Reference
* <http://scikit-learn.org>
* <http://matplotlib.org>
* <https://docs.scipy.org>
* <http://www.numpy.org/>